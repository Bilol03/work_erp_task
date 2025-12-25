import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Stock, StockDocument } from '../inventory/schemas/stock.schema';
import { Product } from '../products/schemas/product.schema';
import { PurchaseReceipt } from '../purchase-receipts/schemas/purchase-receipt.schema';
import { Sale } from '../sales/schema/sale.schema';
@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Sale.name) private readonly saleModel: Model<Sale>,
    @InjectModel(PurchaseReceipt.name)
    private readonly receiptModel: Model<PurchaseReceipt>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Stock.name) private readonly stockModel: Model<StockDocument>,
  ) {}

  // 1️⃣ Sales Summary
  async salesSummary(start: Date, end: Date) {
    console.log(start, end)
    const result = await this.saleModel.aggregate([
      {
        $match: { status: 'CONFIRMED', sale_date: { $gte: start, $lte: end } },
      },
      {
        $group: {
          _id: null,
          total_amount: {
            $sum: { $multiply: ['$lines.quantity', '$lines.unit_price'] },
          },
          sales_count: { $sum: 1 },
        },
      },
    ]);

    const data = result[0] || { total_amount: 0, sales_count: 0 };
    data.avg_sale_value = data.sales_count
      ? data.total_amount / data.sales_count
      : 0;
    return data;
  }

  // 2️⃣ Daily Sales Chart
  async dailySalesChart(start: Date, end: Date) {
    return this.saleModel.aggregate([
      {
        $match: { status: 'CONFIRMED', sale_date: { $gte: start, $lte: end } },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$sale_date' } },
          total_amount: {
            $sum: { $multiply: ['$lines.quantity', '$lines.unit_price'] },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  // 3️⃣ Top Products
  async topProducts(limit = 10) {
    const data = await this.saleModel.aggregate([
      { $match: { status: 'CONFIRMED' } },
      { $unwind: '$lines' },
      {
        $group: {
          _id: '$lines.product_id',
          qty: { $sum: '$lines.quantity' },
          revenue: {
            $sum: { $multiply: ['$lines.quantity', '$lines.unit_price'] },
          },
        },
      },
      { $sort: { qty: -1 } },
      { $limit: limit },
    ]);

    return Promise.all(
      data.map(async (item) => {
        const product = await this.productModel.findById(item._id);
        return {
          product_id: item._id,
          product_name: product?.name || 'Unknown',
          qty: item.qty,
          revenue: item.revenue,
        };
      }),
    );
  }

  // 4️⃣ Inventory Summary
  async inventorySummary() {
    const totalSKUs = await this.productModel.countDocuments({
      is_active: true,
    });
    const stock = await this.stockModel.aggregate([
      { $group: { _id: '$product_id', total_qty: { $sum: '$quantity' } } },
    ]);

    const lowStock = await this.stockModel.aggregate([
      { $match: { quantity: { $lt: 10 } } }, // masalan min_stock_level=10
      {
        $lookup: {
          from: 'products',
          localField: 'product_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: { product_id: 1, product_name: '$product.name', quantity: 1 },
      },
    ]);

    return { totalSKUs, stock, lowStock };
  }

  // 5️⃣ Purchase Summary
  async purchaseSummary(start: Date, end: Date) {
    const result = await this.receiptModel.aggregate([
      {
        $match: {
          status: 'CONFIRMED',
          receipt_date: { $gte: start, $lte: end },
        },
      },
      { $unwind: '$lines' },
      {
        $group: {
          _id: null,
          total_amount: {
            $sum: { $multiply: ['$lines.quantity', '$lines.unit_price'] },
          },
          receipt_count: { $sum: 1 },
        },
      },
    ]);

    return result[0] || { total_amount: 0, receipt_count: 0 };
  }
}
