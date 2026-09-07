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

export type ProductDTO = z.infer<typeof productSchema>;
export type ProductImageDTO = z.infer<typeof productImageSchema>;
export type CreateProductDTO = z.infer<typeof createProductSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;
