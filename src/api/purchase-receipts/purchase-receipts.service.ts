import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InventoryService } from '../inventory/inventory.service';
import { PurchaseReceipt } from './schemas/purchase-receipt.schema';

@Injectable()
export class PurchaseReceiptsService {
  constructor(
    @InjectModel(PurchaseReceipt.name)
    private receiptModel: Model<PurchaseReceipt>,

    private inventoryService: InventoryService,
  ) {}

  async create(dto: any) {
    return this.receiptModel.create({
      ...dto,
      status: 'DRAFT',
      created_by: 'system',
      created_at: new Date(),
    });
  }

  async confirm(id: string) {
    const receipt = await this.receiptModel.findById(id);
    if (!receipt) throw new NotFoundException();

    if (receipt.status !== 'DRAFT') {
      throw new BadRequestException({
        error_code: 'INVALID_STATUS',
        message: 'Only DRAFT receipt can be confirmed',
      });
    }

    // 👉 STOCK REAL O‘ZGARADIGAN JOY
    for (const line of receipt.lines) {
      await this.inventoryService.increaseStock(
        line.product_id,
        receipt.warehouse_id,
        line.quantity,
        {
          expiration_date: line.expiration_date,
          lot_code: line.lot_code,
          serial_numbers: line.serial_numbers,
        },
      );
    }

    receipt.status = 'CONFIRMED';
    receipt.confirmed_by = 'system';
    receipt.confirmed_at = new Date();

    return receipt.save();
  }

  async cancel(id: string, reason) {
    const receipt = await this.receiptModel.findById(id);
    if (!receipt) throw new NotFoundException();

    if (receipt.status !== 'CONFIRMED') {
      throw new BadRequestException({
        error_code: 'INVALID_STATUS',
        message: 'Only CONFIRMED receipt can be cancelled',
      });
    }
    if (!reason) {
      throw new BadRequestException('Cancellation reason is required');
    }

    for (const line of receipt.lines) {
      await this.inventoryService.decreaseStock(
        line.product_id,
        receipt.warehouse_id,
        line.quantity,
        {
          expiration_date: line.expiration_date,
          lot_code: line.lot_code,
          serial_numbers: line.serial_numbers,
        },
      );
    }

    receipt.status = 'CANCELLED';
    receipt.cancelled_by = 'system';
    receipt.cancelled_at = new Date();
    receipt.cancellation_reason = reason;

    return receipt.save();
  }
}
