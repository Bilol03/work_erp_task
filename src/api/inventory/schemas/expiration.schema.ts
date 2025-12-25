import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExpirationStockDocument = ExpirationStock & Document;

@Schema({ timestamps: true })
export class ExpirationStock {
  @Prop({ required: true, index: true })
  product_id: string;

  @Prop({ required: true, index: true })
  warehouse_id: string;

  @Prop({ required: true })
  expiration_date: Date;

  @Prop({ required: true, default: 0 })
  quantity: number;
}

export const ExpirationStockSchema =
  SchemaFactory.createForClass(ExpirationStock);

ExpirationStockSchema.index(
  { product_id: 1, warehouse_id: 1, expiration_date: 1 },
  { unique: true },
);
