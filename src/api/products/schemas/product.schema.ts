import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ProductTrackingType } from 'src/constants/index';


@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  sku: string;

  @Prop()
  barcode?: string;

  @Prop({ required: true })
  unit_of_measure: string; // pcs, kg, box

  @Prop({ required: true, enum: ProductTrackingType })
  tracking_type: ProductTrackingType;

  // Variant logic
  @Prop({ default: false })
  is_variant_parent: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Product' })
  parent_id?: Types.ObjectId; // faqat variant uchun

  @Prop({ type: Object })
  variant_attributes?: { [key: string]: string[] }; // faqat parent uchun

  @Prop({ type: Object })
  attributes?: { [key: string]: string }; // faqat variant uchun

  @Prop()
  sale_price_default?: number;

  @Prop()
  purchase_price_default?: number;

  @Prop()
  min_stock_level?: number;

  @Prop({ default: true })
  is_active: boolean;

  // Audit fields
  @Prop({ required: true })
  created_by: string;

  @Prop()
  confirmed_by?: string;

  @Prop()
  cancelled_by?: string;

  @Prop()
  cancellation_reason?: string;

  @Prop()
  confirmed_at?: Date;

  @Prop()
  cancelled_at?: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);


ProductSchema.index({ sku: 1 }, { unique: true });


ProductSchema.index({ parent_id: 1, attributes: 1 }, { unique: true, sparse: true });
