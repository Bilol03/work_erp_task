import { ApiProperty } from '@nestjs/swagger';
import { SaleLineDto } from './sale-line.dto';

export class CreateSaleDto {
  @ApiProperty()
  warehouse_id: string;

  @ApiProperty()
  sale_date: Date;

  @ApiProperty()
  currency: string;

  @ApiProperty({ type: [SaleLineDto] })
  lines: SaleLineDto[];
}
