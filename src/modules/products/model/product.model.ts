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
 * Sub-schema da imagem do produto (Cloudinary), sem `_id` próprio.
 */
const productImageSchema = new Schema(
  {
    publicId: {
      type: String,
      required: [true, "publicId da imagem é obrigatório"],
    },
    url: {
      type: String,
      required: [true, "URL da imagem é obrigatória"],
    },
  },
  { _id: false },
);

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
    image: { type: productImageSchema, required: false },
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
