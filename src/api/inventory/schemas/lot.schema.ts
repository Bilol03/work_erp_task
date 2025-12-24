import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class Lot extends Document {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  product_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  warehouse_id: Types.ObjectId;

  @Prop({ required: true })
  lot_code: string;

  @Prop({ required: true, min: 0 })
  quantity: number;
}

export const LotSchema = SchemaFactory.createForClass(Lot);

LotSchema.index(
  { product_id: 1, warehouse_id: 1, lot_code: 1 },
  { unique: true },
);
