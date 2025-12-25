import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SerialStockDocument = SerialStock & Document;

@Schema({ timestamps: true })
export class SerialStock {
  @Prop({ required: true, index: true })
  product_id: string;

  @Prop({ required: true, index: true })
  warehouse_id: string;

  @Prop({ required: true, unique: true })
  serial_number: string;

  @Prop({ required: true, enum: ['AVAILABLE', 'SOLD'], default: 'AVAILABLE' })
  status: 'AVAILABLE' | 'SOLD';
}

export const SerialStockSchema =
  SchemaFactory.createForClass(SerialStock);
