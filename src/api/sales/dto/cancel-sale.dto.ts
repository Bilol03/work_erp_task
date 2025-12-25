import { ApiProperty } from '@nestjs/swagger';

export class CancelSaleDto {
  @ApiProperty()
  sale_id: string;

  @ApiProperty()
  reason: string;
}
