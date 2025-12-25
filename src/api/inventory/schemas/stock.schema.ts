import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StockDocument = Stock & Document;

@Schema({ timestamps: true })
export class Stock {
  @Prop({ required: true, index: true })
  product_id: string;

  @Prop({ required: true, index: true })
  warehouse_id: string;

  @Prop({ required: true, default: 0 })
  quantity: number;
}

export const StockSchema = SchemaFactory.createForClass(Stock);
StockSchema.index({ product_id: 1, warehouse_id: 1 }, { unique: true });
