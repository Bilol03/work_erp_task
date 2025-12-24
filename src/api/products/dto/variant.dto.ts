import { IsString, IsEnum, IsObject, IsNotEmpty } from 'class-validator';
import { ProductTrackingType } from 'src/constants';


export class CreateVariantDto {
  @IsString()
  name: string;

  @IsString()
  sku: string;

  @IsString()
  unit_of_measure: string;

  @IsEnum([ProductTrackingType.SIMPLE, ProductTrackingType.SERIALIZED, ProductTrackingType.EXPIRABLE, ProductTrackingType.LOT_TRACKED])
  tracking_type: ProductTrackingType;

  @IsString()
  parent_id: string;

  @IsObject()
  attributes: { [key: string]: string };

  @IsNotEmpty()
  created_by: string;
}
