import { ApiProperty } from '@nestjs/swagger';

export class ConfirmSaleDto {
  @ApiProperty()
  sale_id: string;
}
