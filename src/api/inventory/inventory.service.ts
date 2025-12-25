import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ProductTrackingType } from 'src/constants';
import { ProductsService } from '../products/product.service';

import {
  ExpirationStock,
  ExpirationStockDocument,
} from './schemas/expiration.schema';
import { LotStock, LotStockDocument } from './schemas/lot.schema';
import { SerialStock, SerialStockDocument } from './schemas/serial.schema';
import { Stock, StockDocument } from './schemas/stock.schema';

/* ================= TYPES ================= */

export interface TrackingInfo {
  expiration_date?: Date;
  lot_code?: string;
  serial_numbers?: string[];
}

/* ================= SERVICE ================= */

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Stock.name)
    private readonly stockModel: Model<StockDocument>,

    @InjectModel(SerialStock.name)
    private readonly serialModel: Model<SerialStockDocument>,

    @InjectModel(LotStock.name)
    private readonly lotModel: Model<LotStockDocument>,

    @InjectModel(ExpirationStock.name)
    private readonly expirationModel: Model<ExpirationStockDocument>,

    private readonly productService: ProductsService,
  ) {}

  /* =====================================================
     MASTER METHODS
  ===================================================== */

  async increaseStock(
    product_id: string,
    warehouse_id: string,
    quantity: number,
    tracking?: TrackingInfo,
  ) {
    await this.adjustMasterStock(product_id, warehouse_id, quantity);

    const trackingType = await this.getTrackingType(product_id);

    switch (trackingType) {
      case ProductTrackingType.SIMPLE:
        return;

      case ProductTrackingType.SERIALIZED:
        return this.increaseSerial(product_id, warehouse_id, tracking);

      case ProductTrackingType.LOT_TRACKED:
        return this.increaseLot(product_id, warehouse_id, quantity, tracking);

      case ProductTrackingType.EXPIRABLE:
        return this.increaseExpiration(
          product_id,
          warehouse_id,
          quantity,
          tracking,
        );

      default:
        throw new BadRequestException('INVALID_TRACKING_TYPE');
    }
  }

  async decreaseStock(
    product_id: string,
    warehouse_id: string,
    quantity: number,
    tracking?: TrackingInfo,
  ) {
    await this.checkAvailability(product_id, warehouse_id, quantity, tracking);

    await this.adjustMasterStock(product_id, warehouse_id, -quantity);

    const trackingType = await this.getTrackingType(product_id);

    switch (trackingType) {
      case ProductTrackingType.SIMPLE:
        return;

      case ProductTrackingType.SERIALIZED:
        return this.decreaseSerial(product_id, warehouse_id, tracking);

      case ProductTrackingType.LOT_TRACKED:
        return this.decreaseLot(product_id, warehouse_id, quantity, tracking);

      case ProductTrackingType.EXPIRABLE:
        return this.decreaseExpiration(
          product_id,
          warehouse_id,
          quantity,
          tracking,
        );

      default:
        throw new BadRequestException('INVALID_TRACKING_TYPE');
    }
  }

  /* =====================================================
     AVAILABILITY
  ===================================================== */

  async checkAvailability(
    product_id: string,
    warehouse_id: string,
    quantity: number,
    tracking?: TrackingInfo,
  ) {
    const stock = await this.stockModel.findOne({ product_id, warehouse_id });
    console.log(stock)
    if (!stock || stock.quantity < quantity) {
      throw new BadRequestException('INSUFFICIENT_STOCK');
    }

    const trackingType = await this.getTrackingType(product_id);

    if (trackingType === ProductTrackingType.SERIALIZED) {
      if (!tracking?.serial_numbers?.length) {
        throw new BadRequestException('SERIAL_REQUIRED');
      }

      const count = await this.serialModel.countDocuments({
        product_id,
        warehouse_id,
        serial_number: { $in: tracking.serial_numbers },
        status: 'AVAILABLE',
      });

      if (count !== tracking.serial_numbers.length) {
        throw new BadRequestException('SERIAL_NOT_AVAILABLE');
      }
    }

    if (trackingType === ProductTrackingType.LOT_TRACKED) {
      if (!tracking?.lot_code) {
        throw new BadRequestException('LOT_REQUIRED');
      }

      const lot = await this.lotModel.findOne({
        product_id,
        warehouse_id,
        lot_code: tracking.lot_code,
      });

      if (!lot || lot.quantity < quantity) {
        throw new BadRequestException('LOT_INSUFFICIENT');
      }
    }

    if (trackingType === ProductTrackingType.EXPIRABLE) {
      const exp = await this.expirationModel.findOne({
        product_id,
        warehouse_id,
        expiration_date: tracking?.expiration_date,
      });

      if (!exp || exp.quantity < quantity) {
        throw new BadRequestException('EXPIRATION_INSUFFICIENT');
      }
    }
  }

  /* =====================================================
     MASTER STOCK
  ===================================================== */

  private async adjustMasterStock(
    product_id: string,
    warehouse_id: string,
    delta: number,
  ) {
    const stock = await this.stockModel.findOneAndUpdate(
      { product_id, warehouse_id },
      { $inc: { quantity: delta } },
      { upsert: true, new: true },
    );

    if (stock.quantity < 0) {
      throw new BadRequestException('NEGATIVE_STOCK');
    }
  }

  private async increaseSerial(
    product_id: string,
    warehouse_id: string,
    tracking?: TrackingInfo,
  ) {
    if (!tracking?.serial_numbers?.length) {
      throw new BadRequestException('SERIAL_REQUIRED');
    }

    for (const sn of tracking.serial_numbers) {
      await this.serialModel.create({
        product_id,
        warehouse_id,
        serial_number: sn,
        status: 'AVAILABLE',
      });
    }
  }

  private async decreaseSerial(
    product_id: string,
    warehouse_id: string,
    tracking?: TrackingInfo,
  ) {
    for (const sn of tracking?.serial_numbers!) {
      const updated = await this.serialModel.findOneAndUpdate(
        {
          product_id,
          warehouse_id,
          serial_number: sn,
          status: 'AVAILABLE',
        },
        { status: 'SOLD' },
      );

      if (!updated) {
        throw new BadRequestException(`SERIAL_NOT_AVAILABLE: ${sn}`);
      }
    }
  }

  /* =====================================================
     LOT
  ===================================================== */

  private async increaseLot(
    product_id: string,
    warehouse_id: string,
    quantity: number,
    tracking?: TrackingInfo,
  ) {
    if (!tracking?.lot_code) {
      throw new BadRequestException('LOT_REQUIRED');
    }

    await this.lotModel.findOneAndUpdate(
      { product_id, warehouse_id, lot_code: tracking.lot_code },
      { $inc: { quantity } },
      { upsert: true },
    );
  }

  private async decreaseLot(
    product_id: string,
    warehouse_id: string,
    quantity: number,
    tracking?: TrackingInfo,
  ) {
    const lot = await this.lotModel.findOne({
      product_id,
      warehouse_id,
      lot_code: tracking?.lot_code,
    });

    if (!lot || lot.quantity < quantity) {
      throw new BadRequestException('LOT_INSUFFICIENT');
    }

    lot.quantity -= quantity;
    await lot.save();
  }

  /* ========================================
        EXPIRATION
  ======================================== */

  private async increaseExpiration(
    product_id: string,
    warehouse_id: string,
    quantity: number,
    tracking?: TrackingInfo,
  ) {
    if (!tracking?.expiration_date) {
      throw new BadRequestException('EXPIRATION_REQUIRED');
    }

    await this.expirationModel.findOneAndUpdate(
      {
        product_id,
        warehouse_id,
        expiration_date: tracking.expiration_date,
      },
      { $inc: { quantity } },
      { upsert: true },
    );
  }

  private async decreaseExpiration(
    product_id: string,
    warehouse_id: string,
    quantity: number,
    tracking?: TrackingInfo,
  ) {
    const exp = await this.expirationModel.findOne({
      product_id,
      warehouse_id,
      expiration_date: tracking?.expiration_date,
    });

    if (!exp || exp.quantity < quantity) {
      throw new BadRequestException('EXPIRATION_INSUFFICIENT');
    }

    exp.quantity -= quantity;
    await exp.save();
  }

  private async getTrackingType(
    product_id: string,
  ) {
    const product = await this.productService.findOne(product_id);

    if (!product) {
      throw new BadRequestException('PRODUCT_NOT_FOUND');
    }
    return product.tracking_type;
  }
}
