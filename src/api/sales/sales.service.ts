import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InventoryService } from '../inventory/inventory.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Sale } from './schema/sale.schema';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale.name)
    private readonly saleModel: Model<Sale>,
    private readonly inventoryService: InventoryService,
  ) {}

  async create(dto: CreateSaleDto) {
    return this.saleModel.create(dto);
  }

  async confirm(id: string) {
    const sale = await this.saleModel.findById(id);
    if (!sale) throw new NotFoundException();

    if (sale.status !== 'DRAFT') {
      throw new BadRequestException('INVALID_STATUS');
    }

    for (const line of sale.lines) {
      await this.inventoryService.checkAvailability(
        line.product_id,
        sale.warehouse_id,
        line.quantity,
        {
          expiration_date: line.expiration_date,
          lot_code: line.lot_code,
          serial_numbers: line.serial_numbers,
        },
      );
    }

    for (const line of sale.lines) {
      await this.inventoryService.decreaseStock(
        line.product_id,
        sale.warehouse_id,
        line.quantity,
        {
          expiration_date: line.expiration_date,
          lot_code: line.lot_code,
          serial_numbers: line.serial_numbers,
        },
      );
    }

    sale.status = 'CONFIRMED';
    sale.confirmed_by = 'system';
    sale.confirmed_at = new Date();
    return sale.save();
  }

  async cancel(id: string, reason: string) {
    const sale = await this.saleModel.findById(id);
    if (!sale) throw new NotFoundException();

    if (sale.status !== 'CONFIRMED') {
      throw new BadRequestException('ONLY_CONFIRMED_CAN_CANCEL');
    }

    if (!reason) throw new BadRequestException('Reason is required');

    for (const line of sale.lines) {
      await this.inventoryService.increaseStock(
        line.product_id,
        sale.warehouse_id,
        line.quantity,
        {
          expiration_date: line.expiration_date,
          lot_code: line.lot_code,
          serial_numbers: line.serial_numbers,
        },
      );
    }

    sale.status = 'CANCELLED';
    sale.cancelled_at = new Date();
    sale.cancelled_by = 'system';
    sale.cancellation_reason = reason;

    return sale.save();
  }
}
