/**
 * Modelo Mongoose do produto.
 *
 * Espelha o contrato tipado `ProductDTO` (Zod) para persistência no MongoDB.
 * A validação de entrada é feita na borda com Zod (fail fast), não aqui.
 */
import { Schema, model, type Model } from "mongoose";
import type { ProductDTO } from "../dto/product.dto";

/**
 * Documento de produto persistido no MongoDB.
 *
 * Combina os dados de negócio (`ProductDTO`) com os timestamps gerenciados pelo Mongoose.
 */
export interface ProductDocument extends ProductDTO {
  /** Data de criação do registro. */
  createdAt: Date;
  /** Data da última atualização do registro. */
  updatedAt: Date;
}

/**
 * Schema Mongoose da coleção de produtos.
 */
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
      _id: false,
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

/**
 * Modelo registrado da coleção `products`.
 *
 * Utilizado pelos repositories do módulo de Produtos.
 */
export const ProductModel: Model<ProductDocument> = model<ProductDocument>(
  "Product",
  productSchema,
);
