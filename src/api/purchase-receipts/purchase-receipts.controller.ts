import { Body, Controller, Param, Post, Req } from '@nestjs/common';
import { CreatePurchaseReceiptDto } from './dto/create-purchase-receipt.dto';
import { PurchaseReceiptsService } from './purchase-receipts.service';

@Controller('purchase-receipts')
export class PurchaseReceiptsController {
  constructor(private readonly service: PurchaseReceiptsService) {}

  @Post()
  create(@Body() dto: CreatePurchaseReceiptDto) {
    return this.service.create(dto);
  }

  @Post(':id/confirm')
  confirm(@Param('id') id: string ) {
    return this.service.confirm(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Body('reason') reason: string) {
    return this.service.cancel(id, reason);
  }
}
