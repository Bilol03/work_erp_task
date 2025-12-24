import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Stock extends Document {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  product_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  warehouse_id: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  quantity: number;
}

export const StockSchema = SchemaFactory.createForClass(Stock);

// 1 product + 1 warehouse = 1 stock row
StockSchema.index({ product_id: 1, warehouse_id: 1 }, { unique: true });
