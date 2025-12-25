import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PurchaseReceiptLineDto } from './purchase-receipt-line.dto';

export class CreatePurchaseReceiptDto {
  @ApiProperty({ example: 'supplier_1' })
  @IsString()
  supplier_id: string;

  @ApiProperty({ example: 'warehouse_1' })
  @IsString()
  warehouse_id: string;

  @ApiProperty({ example: '2025-12-24' })
  @IsDateString()
  receipt_date: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  currency: string;

  @ApiProperty({ type: [PurchaseReceiptLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseReceiptLineDto)
  lines: PurchaseReceiptLineDto[];
}
