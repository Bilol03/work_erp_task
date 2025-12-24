import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class Expiration extends Document {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  product_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  warehouse_id: Types.ObjectId;

  @Prop({ required: true })
  expiration_date: Date;

  @Prop({ required: true, min: 0 })
  quantity: number;
}

export const ExpirationSchema = SchemaFactory.createForClass(Expiration);

ExpirationSchema.index(
  { product_id: 1, warehouse_id: 1, expiration_date: 1 },
  { unique: true },
);
