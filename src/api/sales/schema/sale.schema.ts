import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SaleLine } from './sale-line.schema';

@Schema({ timestamps: true })
export class Sale extends Document {
  @Prop()
  customer_id?: string;

  @Prop({ required: true })
  warehouse_id: string;

  @Prop({ required: true })
  sale_date: Date;

  @Prop({ required: true })
  currency: string;

  @Prop({ default: 'DRAFT', index: true })
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

  @Prop({ type: [SaleLine], default: [] })
  lines: SaleLine[];

  // audit
  @Prop()
  confirmed_at?: Date;

  @Prop()
  cancelled_at?: Date;

  @Prop()
  cancellation_reason?: string;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);
