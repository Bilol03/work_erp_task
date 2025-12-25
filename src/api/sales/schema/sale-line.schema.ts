import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class SaleLine {
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

  @Prop([String])
  serial_numbers?: string[];
}
