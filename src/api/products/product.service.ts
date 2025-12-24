import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Product } from "./schemas/product.schema";
import { Model } from "mongoose";
import { CreateProductDto, UpdateProductDto } from "./dto/prod.dto";

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<Product>) {}

  async create(dto: CreateProductDto, userId: string) {
    const product = new this.productModel({ ...dto, created_by: userId });
    return product.save();
  }

  async findAll() {
    return this.productModel.find({ is_active: true });
  }

  async findOne(id: string) {
    return this.productModel.findById(id);
  }

  async update(id: string, dto: UpdateProductDto) {
    // TODO: validation rules
    return this.productModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async softDelete(id: string) {
    return this.productModel.findByIdAndUpdate(id, { is_active: false }, { new: true });
  }
}
