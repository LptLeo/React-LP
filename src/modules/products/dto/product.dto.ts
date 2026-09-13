/**
 * DTOs e schemas de validação do módulo de Produtos.
 *
 * `productSchema` é o contrato completo de produto (exibição no catálogo e
 * administração). Os schemas usam `.describe()` para autodocumentação e são a
 * fonte de validação na borda HTTP (serverless functions / frontend).
 */
import { z } from "zod";

export const productImageSchema = z
  .object({
    /** Identificador público da imagem no Cloudinary. */
    publicId: z.string().min(1, "publicId da imagem é obrigatório"),
    /** URL pública da imagem hospedada no Cloudinary. */
    url: z.url("URL da imagem inválida"),
  })
  .describe("Imagem do produto armazenada no Cloudinary");

export const productSchema = z
  .object({
    /** Título exibido no catálogo e nos cards. */
    title: z.string().min(2, "Título é obrigatório"),
    /** Descrição detalhada exibida na página do produto. */
    description: z
      .string()
      .min(10, "Descrição muito curta (mínimo 10 caracteres)"),
    /** Preço atual (por) em reais. */
    price: z.number().positive("Preço deve ser maior que zero"),
    /** Preço original (de) para exibição de desconto — opcional. */
    priceOriginal: z
      .number()
      .positive("Preço original deve ser maior que zero")
      .optional(),
    /** Imagem principal do produto (Cloudinary). */
    image: productImageSchema.optional(),
    /** Categoria livre do produto (ex: eletrônicos, moda, casa). */
    category: z.string().min(2, "Categoria é obrigatória"),
    /** Indica se o produto aparece na seção de destaques. */
    featured: z.boolean().default(false),
    /** Controla a visibilidade do produto no catálogo público. */
    active: z.boolean().default(true),
  })
  .describe("Produto do catálogo digital");

/* Schema de criação — mesmo contrato do produto completo. */
export const createProductSchema = productSchema;

/* Schema de atualização — todos os campos opcionais (envio parcial). */
export const updateProductSchema = productSchema.partial();

/* Query de listagem pública (paginação, busca e filtros do catálogo). */
export const productListQuerySchema = z
  .object({
    page: z.coerce
      .number()
      .int("Página deve ser um número inteiro")
      .positive("Página deve ser maior que zero")
      .default(1)
      .describe("Número da página, iniciando em 1"),
    limit: z.coerce
      .number()
      .int("Limite deve ser um número inteiro")
      .positive("Limite deve ser maior que zero")
      .max(50, "Limite máximo de 50 itens por página")
      .default(10)
      .describe("Quantidade de itens por página (máx. 50)"),
    search: z
      .string()
      .trim()
      .min(1, "Busca vazia não é permitida")
      .optional()
      .describe("Busca case-insensitive por título ou categoria"),
    category: z
      .string()
      .trim()
      .min(1, "Categoria vazia não é permitida")
      .optional()
      .describe("Filtro por categoria exata"),
    featured: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional()
      .describe("Filtra apenas produtos em destaque (true/false)"),
    active: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional()
      .describe("Filtra por visibilidade pública (padrão: true)"),
  })
  .describe("Parâmetros de listagem de produtos (paginação, busca e filtros)");

/* Parâmetro de rota com o ID do produto. */
export const productIdParamsSchema = z
  .object({
    id: z.string().min(1, "ID do produto é obrigatório"),
  })
  .describe("Identificador do produto (ObjectId do MongoDB)");

export type ProductDTO = z.infer<typeof productSchema>;
export type ProductImageDTO = z.infer<typeof productImageSchema>;
export type CreateProductDTO = z.infer<typeof createProductSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;
export type ProductListQueryDTO = z.infer<typeof productListQuerySchema>;
export type ProductIdParamsDTO = z.infer<typeof productIdParamsSchema>;
