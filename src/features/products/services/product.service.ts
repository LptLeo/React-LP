/**
 * Serviço de produtos do painel administrativo.
 *
 * Encapsula as chamadas à API (`/api/products`) com token JWT: listagem
 * (incluindo inativos), criação, atualização e remoção.
 */
import { getStoredToken } from "@/features/auth/services/auth.service";
import type { ProductFormValues } from "../schemas/product.form.schema";

export interface AdminProductImage {
  publicId: string;
  url: string;
}

export interface AdminProduct extends ProductFormValues {
  /** Identificador do produto. */
  _id: string;
  /** Imagem principal do produto (Cloudinary) — opcional. */
  image?: AdminProductImage | null;
  /** Data de criação do registro. */
  createdAt: string;
  /** Data da última atualização do registro. */
  updatedAt: string;
}

export interface ProductPageData {
  items: AdminProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const API_BASE = "/api/products";

/**
 * Extrai uma mensagem legível de uma resposta de erro da API.
 *
 * @param payload - Corpo da resposta (JSON) já serializado.
 * @returns Mensagem de erro amigável.
 */
function extractApiError(payload: unknown): string {
  if (typeof payload !== "object" || payload === null) {
    return "Erro ao processar a requisição.";
  }

  const errorPayload = payload as {
    message?: string;
    errors?: Record<string, string[]>;
  };

  if (errorPayload.message) {
    return errorPayload.message;
  }

  if (errorPayload.errors) {
    const firstMessage = Object.values(errorPayload.errors).flat()[0];
    return firstMessage ?? "Verifique os dados informados.";
  }

  return "Erro ao processar a requisição.";
}

/**
 * Executa uma requisição JSON à API com token Bearer.
 *
 * @param path - Caminho da API (ex: `/api/products`).
 * @param init - Configuração do `fetch` (`method`, `body`...).
 * @returns Payload de sucesso da resposta (`{ status, data }`).
 * @throws Error - Se a API falhar, com a mensagem do backend.
 */
async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken();

  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(extractApiError(payload));
  }

  return payload as T;
}

/**
 * Lista produtos do catálogo (ativo e inativos) para o painel.
 *
 * @param page - Número da página (inicia em 1).
 * @param limit - Quantidade de itens por página (máx. 50).
 * @returns Página de produtos com metadados de paginação.
 */
export async function fetchAdminProducts(
  page = 1,
  limit = 10,
): Promise<ProductPageData> {
  const payload = await apiRequest<{ status: string; data: ProductPageData }>(
    `${API_BASE}?page=${page}&limit=${limit}`,
  );
  return payload.data;
}

/**
 * Cria um produto no catálogo.
 *
 * @param input - Dados do produto validados (Zod).
 * @returns Produto criado (com `_id` e datas).
 */
export async function createAdminProduct(
  input: ProductFormValues,
): Promise<AdminProduct> {
  const payload = await apiRequest<{ status: string; data: AdminProduct }>(
    API_BASE,
    { method: "POST", body: JSON.stringify(input) },
  );
  return payload.data;
}

/**
 * Atualiza um produto existente (envio parcial).
 *
 * @param id - Identificador do produto.
 * @param input - Campos a atualizar, validadoss (Zod).
 * @returns Produto atualizado.
 */
export async function updateAdminProduct(
  id: string,
  input: Partial<ProductFormValues>,
): Promise<AdminProduct> {
  const payload = await apiRequest<{ status: string; data: AdminProduct }>(
    `${API_BASE}/${id}`,
    { method: "PUT", body: JSON.stringify(input) },
  );
  return payload.data;
}

/**
 * Remove um produto do catálogo.
 *
 * @param id - Identificador do produto.
 */
export async function deleteAdminProduct(id: string): Promise<void> {
  await apiRequest<{ status: string }>(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
}
