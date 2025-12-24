import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProductDto, UpdateProductDto } from './dto/prod.dto';
import { Product } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async isProductUsed(productId: string): Promise<boolean> {
    return false;
  }

  async findAll() {
    return this.productModel.find({ is_active: true });
  }

  async findOne(id: string) {
    return this.productModel.findById(id);
  }
  async create(dto: CreateProductDto, userId: string) {
    if (dto.tracking_type === 'VARIANT') {
      if (
        !dto.variant_attributes ||
        Object.keys(dto.variant_attributes).length === 0
      ) {
        throw new BadRequestException({
          error_code: 'VARIANT_ATTRIBUTES_REQUIRED',
          message: 'Variant parent must define variant_attributes',
        });
      }
    }

    // Non-variant product cannot have variant_attributes
    if (dto.tracking_type !== 'VARIANT' && dto.variant_attributes) {
      throw new BadRequestException({
        error_code: 'INVALID_VARIANT_ATTRIBUTES',
        message: 'Only VARIANT parent can have variant_attributes',
      });
    }
    console.log(userId);
    return this.productModel.create({
      ...dto,
      is_active: true,
      created_by: userId,
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException();

    const used = await this.isProductUsed(product._id.toString());

    if (used) {
      if (dto.tracking_type && dto.tracking_type !== product.tracking_type) {
        throw new BadRequestException({
          error_code: 'TRACKING_TYPE_IMMUTABLE',
          message: 'Tracking type cannot be changed after product usage',
          field: 'tracking_type',
        });
      }

      if (dto.sku && dto.sku !== product.sku) {
        throw new BadRequestException({
          error_code: 'SKU_IMMUTABLE',
          message: 'SKU cannot be changed after product usage',
          field: 'sku',
        });
      }
    }

    return this.productModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async softDelete(id: string) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException();

    const used = await this.isProductUsed(product._id.toString());

    // Har doim soft delete
    return this.productModel.findByIdAndUpdate(
      id,
      { is_active: false },
      { new: true },
    );
  }
}
