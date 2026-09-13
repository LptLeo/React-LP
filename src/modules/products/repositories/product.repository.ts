/**
 * Repositório de acesso aos dados de produtos.
 *
 * Comunicação direta com o MongoDB via Mongoose. A validação de entrada é
 * feita na borda (Zod) e as regras de negócio ficam no service.
 */
import mongoose, { type HydratedDocument } from "mongoose";
import type { CreateProductDTO, UpdateProductDTO } from "../dto/product.dto";
import { ProductModel, type ProductDocument } from "../model/product.model";

/** Filtros aplicáveis à listagem de produtos. */
export interface ProductListFilters {
  search?: string;
  category?: string;
  featured?: boolean;
  active?: boolean;
}

/** Página de resultados de produtos com metadados de paginação. */
export interface ProductPage {
  /** Produtos da página atual. */
  items: HydratedDocument<ProductDocument>[];
  /** Total de produtos que casam com os filtros (ignorando paginação). */
  total: number;
  /** Número da página retornada (inicia em 1). */
  page: number;
  /** Quantidade de itens por página. */
  limit: number;
  /** Total de páginas disponíveis. */
  totalPages: number;
}

/**
 * Lista produtos com paginação e filtros, ordenados por criação
 * (mais recentes primeiro).
 *
 * @param filters - Filtros opcionais (search, category, featured, active).
 * @param page - Número da página (a partir de 1).
 * @param limit - Quantidade de itens por página.
 * @returns Página com os produtos encontrados e metadados de paginação.
 */
export async function listProducts(
  filters: ProductListFilters,
  page: number,
  limit: number,
): Promise<ProductPage> {
  const query: mongoose.QueryFilter<ProductDocument> = {};

  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: "i" } },
      { category: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.featured !== undefined) {
    query.featured = filters.featured;
  }

  if (filters.active !== undefined) {
    query.active = filters.active;
  }

  const [items, total] = await Promise.all([
    ProductModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ProductModel.countDocuments(query),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Busca um produto pelo ID no repositório.
 *
 * @param id - ID (ObjectId) do produto.
 * @returns Documento do produto encontrado ou `null` caso não exista.
 */
export async function findProductById(
  id: string,
): Promise<HydratedDocument<ProductDocument> | null> {
  return ProductModel.findById(id);
}

/**
 * Persiste um novo produto no banco.
 *
 * @param data - Dados validados do produto (Zod).
 * @returns Documento do produto criado.
 */
export async function createProduct(
  data: CreateProductDTO,
): Promise<HydratedDocument<ProductDocument>> {
  return ProductModel.create(data);
}

/**
 * Atualiza um produto existente pelo ID.
 *
 * @param id - ID (ObjectId) do produto.
 * @param data - Campos parciais validados do produto (Zod).
 * @returns Documento atualizado ou `null` caso o produto não exista.
 */
export async function updateProduct(
  id: string,
  data: UpdateProductDTO,
): Promise<HydratedDocument<ProductDocument> | null> {
  return ProductModel.findByIdAndUpdate(id, data, {
    returnDocument: "after",
    runValidators: true,
  });
}

/**
 * Remove um produto existente pelo ID.
 *
 * @param id - ID (ObjectId) do produto.
 * @returns Documento removido ou `null` caso o produto não exista.
 */
export async function deleteProduct(
  id: string,
): Promise<HydratedDocument<ProductDocument> | null> {
  return ProductModel.findByIdAndDelete(id);
}
