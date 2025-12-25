import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from './api/products/product.module';
import { PurchaseReceiptsModule } from './api/purchase-receipts/purchase-receipts.module';
import { SalesModule } from './api/sales/sales.module';
import { DashboardModule } from './api/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),
    ProductsModule,
    PurchaseReceiptsModule,
    SalesModule,
    DashboardModule
  ],
})
export class AppModule {}
