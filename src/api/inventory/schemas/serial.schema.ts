import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class Serial extends Document {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  product_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  warehouse_id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  serial_number: string;

  @Prop({ default: false })
  is_sold: boolean;
}

export const SerialSchema = SchemaFactory.createForClass(Serial);
