/**
 * Modelo Mongoose do produto.
 *
 * Espelha o contrato Tipagem `ProductDTO` (Zod) para persistência no MongoDB.
 * Não valida inputs — a validação é feita na borda com Zod (fail fast).
 */
import { Schema, model, type Model } from "mongoose";
import type { ProductDTO } from "../dto/product.dto";

export interface ProductDocument extends ProductDTO {
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<ProductDocument>(
  {
    title: {
      type: String,
      required: [true, "Título é obrigatório"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Descrição é obrigatória"],
      trim: true,
    },
    price: { type: Number, required: [true, "Preço é obrigatório"], min: 0.01 },
    priceOriginal: { type: Number, min: 0.01 },
    image: {
      publicId: { type: String, required: true },
      url: { type: String, required: true },
    },
    category: {
      type: String,
      required: [true, "Categoria é obrigatória"],
      trim: true,
      index: true,
    },
    featured: { type: Boolean, default: false, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false },
);

export const ProductModel: Model<ProductDocument> = model<ProductDocument>(
  "Product",
  productSchema,
);
