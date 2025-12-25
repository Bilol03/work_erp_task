import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PurchaseReceiptLine } from './purchase-receipt-line.schema';

export type PurchaseReceiptDocument = PurchaseReceipt & Document;

@Schema({ timestamps: true })
export class PurchaseReceipt {
  @Prop({ required: true })
  supplier_id: string;

  @Prop({ required: true })
  warehouse_id: string;

  @Prop({ required: true })
  receipt_date: Date;

  @Prop({ required: true })
  currency: string;

  @Prop({
    type: String,
    enum: ['DRAFT', 'CONFIRMED', 'CANCELLED'],
    default: 'DRAFT',
    index: true,
  })
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

  @Prop({ type: [PurchaseReceiptLine], default: [] })
  lines: PurchaseReceiptLine[];

  @Prop()
  comment?: string;

  @Prop()
  created_by?: string;

  @Prop()
  confirmed_by?: string;

  @Prop()
  confirmed_at?: Date;

  @Prop()
  cancelled_by?: string;

  @Prop()
  cancelled_at?: Date;

  @Prop()
  cancellation_reason?: string;
}

export const PurchaseReceiptSchema =
  SchemaFactory.createForClass(PurchaseReceipt);

