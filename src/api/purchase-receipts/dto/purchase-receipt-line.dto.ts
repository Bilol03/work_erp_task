import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class PurchaseReceiptLineDto {
  @ApiProperty({ example: 'prod_123' })
  @IsString()
  product_id: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 25 })
  @IsNumber()
  @Min(0)
  unit_price: number;

  @ApiProperty({ example: '2026-12-31', required: false })
  @IsOptional()
  expiration_date?: Date;

  @ApiProperty({ example: 'LOT-001', required: false })
  @IsOptional()
  lot_code?: string;

  @ApiProperty({
    example: ['SN001', 'SN002'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  serial_numbers?: string[];
}
