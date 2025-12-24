import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ProductTrackingType } from 'src/constants';

export class CreateProductDto {
  @IsString()
  @ApiProperty({ example: 'Prod Name' })
  name: string;

  @IsString()
  @ApiProperty({ example: 'R-TSH-M' })
  sku: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '012345678905' })
  barcode?: string;

  @IsString()
  @ApiProperty({ example: 'kg' })
  unit_of_measure: string;

  @IsEnum(ProductTrackingType)
  @ApiProperty({ example: ProductTrackingType })
  tracking_type: ProductTrackingType;

  @IsOptional()
  @IsObject()
  @ApiProperty({
    example: {
      size: ['S', 'M', 'L'],
      color: ['Red', 'Blue'],
    },
    description: 'Variant parent uchun atributlar (masalan: size, color)',
  })
  variant_attributes?: { [key: string]: string[] };

  @IsOptional()
  @IsNumber()
  @ApiProperty({example: 15000})
  sale_price_default?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({example: 10000})
  purchase_price_default?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({example: 10})
  min_stock_level?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
