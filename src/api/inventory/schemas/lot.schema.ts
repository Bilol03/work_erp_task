import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LotStockDocument = LotStock & Document;

@Schema({ timestamps: true })
export class LotStock {
  @Prop({ required: true, index: true })
  product_id: string;

  @Prop({ required: true, index: true })
  warehouse_id: string;

  @Prop({ required: true })
  lot_code: string;

  @Prop({ required: true, default: 0 })
  quantity: number;
}

export const LotStockSchema = SchemaFactory.createForClass(LotStock);
LotStockSchema.index(
  { product_id: 1, warehouse_id: 1, lot_code: 1 },
  { unique: true },
);
