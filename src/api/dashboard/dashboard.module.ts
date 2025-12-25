import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Sale, SaleSchema } from "../sales/schema/sale.schema";
import { PurchaseReceipt, PurchaseReceiptSchema } from "../purchase-receipts/schemas/purchase-receipt.schema";
import { Product, ProductSchema } from "../products/schemas/product.schema";
import { InventoryModule } from "../inventory/inventory.module";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { Stock, StockSchema } from "../inventory/schemas/stock.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sale.name, schema: SaleSchema },
      { name: PurchaseReceipt.name, schema: PurchaseReceiptSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Stock.name, schema: StockSchema },
    ]),
    InventoryModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
