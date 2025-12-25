import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Stock, StockSchema } from "./schemas/stock.schema";
import { SerialStock, SerialStockSchema } from "./schemas/serial.schema";
import { LotStock, LotStockSchema } from "./schemas/lot.schema";
import { ExpirationStock, ExpirationStockSchema } from "./schemas/expiration.schema";
import { InventoryService } from "./inventory.service";
import { ProductsService } from "../products/product.service";
import { ProductsModule } from "../products/product.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Stock.name, schema: StockSchema },
      { name: SerialStock.name, schema: SerialStockSchema },
      { name: LotStock.name, schema: LotStockSchema },
      { name: ExpirationStock.name, schema: ExpirationStockSchema },
    ]),
    ProductsModule
  ],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
