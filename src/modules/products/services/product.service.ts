/**
 * Regras de negócio do módulo de Produtos.
 *
 * Funções puras exportadas que validadam regras (Fail Fast), aplicam defaults
 * e orquestram o repositório. Não acessam objetos de requisição/resposta.
 */
import mongoose from "mongoose";
import { type HydratedDocument } from "mongoose";
import { AppError } from "../../../shared/errors/AppError";
import type {
  CreateProductDTO,
  ProductListQueryDTO,
  UpdateProductDTO,
} from "../dto/product.dto";
import type { ProductDocument } from "../model/product.model";
import {
  createProduct as createProductInDatabase,
  deleteProduct as deleteProductInDatabase,
  findProductById as findProductInDatabase,
  listProducts as listProductsInDatabase,
  updateProduct as updateProductInDatabase,
  type ProductPage,
} from "../repositories/product.repository";

/**
 * Valida se o ID informado é um ObjectId do MongoDB válido (cláusula guarda).
 *
 * @param id - ID do produto.
 * @throws AppError - Se o ID não for um ObjectId válido (status 400).
 */
function assertValidProductId(id: string): void {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("ID de produto inválido.", 400);
  }
}

/**
 * Lista produtos públicos com paginação e filtros.
 *
 * Por padrão apenas produtos ativos são exibidos (visibilidade do catálogo).
 *
 * @param query - Parâmetros validados de listagem (página, limite, busca e filtros).
 * @returns Página de produtos com metadados de paginação.
 */
export async function listProducts(
  query: ProductListQueryDTO,
): Promise<ProductPage> {
  return listProductsInDatabase(
    {
      search: query.search || undefined,
      category: query.category || undefined,
      featured: query.featured,
      active: query.active ?? true,
    },
    query.page,
    query.limit,
  );
}

/**
 * Busca um produto pelo ID.
 *
 * @param id - ID (ObjectId) do produto.
 * @returns Documento do produto encontrado.
 * @throws AppError - ID inválido (400) ou produto inexistente (404).
 */
export async function getProductById(
  id: string,
): Promise<HydratedDocument<ProductDocument>> {
  assertValidProductId(id);

  const product = await findProductInDatabase(id);

  if (!product) {
    throw new AppError("Produto não encontrado.", 404);
  }

  return product;
}

/**
 * Cria um novo produto no catálogo.
 *
 * @param data - Dados validados do produto (Zod).
 * @returns Documento do produto criado.
 */
export async function createProduct(
  data: CreateProductDTO,
): Promise<HydratedDocument<ProductDocument>> {
  return createProductInDatabase(data);
}

/**
 * Atualiza parcialmente um produto pelo ID.
 *
 * @param id - ID (ObjectId) do produto.
 * @param data - Campos parciais validados do produto (Zod).
 * @returns Documento do produto atualizado.
 * @throws AppError - ID inválido (400) ou produto inexistente (404).
 */
export async function updateProduct(
  id: string,
  data: UpdateProductDTO,
): Promise<HydratedDocument<ProductDocument>> {
  assertValidProductId(id);

  const product = await updateProductInDatabase(id, data);

  if (!product) {
    throw new AppError("Produto não encontrado.", 404);
  }

  return product;
}

/**
 * Remove um produto pelo ID.
 *
 * @param id - ID (ObjectId) do produto.
 * @throws AppError - ID inválido (400) ou produto inexistente (404).
 */
export async function deleteProduct(id: string): Promise<void> {
  assertValidProductId(id);

  const product = await deleteProductInDatabase(id);

  if (!product) {
    throw new AppError("Produto não encontrado.", 404);
  }
}
