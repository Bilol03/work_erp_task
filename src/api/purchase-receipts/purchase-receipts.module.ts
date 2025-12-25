import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PurchaseReceiptsController } from './purchase-receipts.controller';
import { PurchaseReceiptsService } from './purchase-receipts.service';
import {
  PurchaseReceipt,
  PurchaseReceiptSchema,
} from './schemas/purchase-receipt.schema';

import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PurchaseReceipt.name, schema: PurchaseReceiptSchema },
    ]),
    InventoryModule, // 👈 stock uchun
  ],
  controllers: [PurchaseReceiptsController],
  providers: [PurchaseReceiptsService],
})
export class PurchaseReceiptsModule {}
