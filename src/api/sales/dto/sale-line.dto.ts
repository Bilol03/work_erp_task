import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SaleLineDto {
  @ApiProperty()
  product_id: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unit_price: number;

  @ApiPropertyOptional()
  expiration_date?: Date;

  @ApiPropertyOptional()
  lot_code?: string;

  @ApiPropertyOptional({ type: [String] })
  serial_numbers?: string[];
}
