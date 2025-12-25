import { Body, Controller, Post } from "@nestjs/common";
import { SalesService } from "./sales.service";
import { CreateSaleDto } from "./dto/create-sale.dto";
import { ConfirmSaleDto } from "./dto/confirm-sale.dto";
import { CancelSaleDto } from "./dto/cancel-sale.dto";

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(@Body() dto: CreateSaleDto) {
    return this.salesService.create(dto);
  }

  @Post('confirm')
  confirm(@Body() dto: ConfirmSaleDto) {
    return this.salesService.confirm(dto.sale_id);
  }

  @Post('cancel')
  cancel(@Body() dto: CancelSaleDto) {
    return this.salesService.cancel(dto.sale_id, dto.reason);
  }
}
