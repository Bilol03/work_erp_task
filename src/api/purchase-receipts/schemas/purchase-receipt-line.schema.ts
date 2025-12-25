import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class PurchaseReceiptLine {
  @Prop({ required: true })
  product_id: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  unit_price: number;

  // tracking
  @Prop()
  expiration_date?: Date;

  @Prop()
  lot_code?: string;

  @Prop({ type: [String] })
  serial_numbers?: string[];
}
