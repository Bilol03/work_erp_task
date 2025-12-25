import { Controller, Get, Query } from '@nestjs/common';
import { startEndDateDto } from 'src/dto/index.dto';
import { DashboardService } from './dashboard.service';
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('sales-summary')
  salesSummary(@Query('start') start: string, @Query('end') end: string) {
    return this.dashboardService.salesSummary(new Date(start), new Date(end));
  }

  @Get('daily-sales')
  dailySales(@Query('start') start: string, @Query('end') end: string) {
    return this.dashboardService.dailySalesChart(new Date(start), new Date(end));
  }

  @Get('top-products')
  topProducts(@Query('limit') limit?: number) {
    return this.dashboardService.topProducts(limit || 10);
  }

  @Get('inventory-summary')
  inventorySummary() {
    return this.dashboardService.inventorySummary();
  }

  @Get('purchase-summary')
  purchaseSummary(@Query('start') start: string, @Query('end') end: string) {
    return this.dashboardService.purchaseSummary(new Date(start), new Date(end));
  }
}
