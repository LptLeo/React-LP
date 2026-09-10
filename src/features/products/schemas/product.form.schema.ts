/**
 * Schema de validação do formulário de produto (painel administrativo).
 *
 * Espelha o `productSchema` do backend; `price` e `priceOriginal` são
 * convertidos de string (inputs de formulário) para número.
 */
import { z } from "zod";

export const productFormSchema = z.object({
  /** Título exibido no catálogo e nos cards. */
  title: z.string().min(2, "Título é obrigatório"),
  /** Descrição detalhada exibida na página do produto. */
  description: z
    .string()
    .min(10, "Descrição muito curta (mínimo 10 caracteres)"),
  /** Preço atual (por) em reais. */
  price: z.coerce.number().positive("Preço deve ser maior que zero"),
  /** Preço original (de) para exibição de desconto — opcional. */
  priceOriginal: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce
      .number()
      .positive("Preço original deve ser maior que zero")
      .optional(),
  ),
  /** Categoria livre do produto (ex: eletrônicos, moda, casa). */
  category: z.string().min(2, "Categoria é obrigatória"),
  /** Indica se o produto aparece na seção de destaques. */
  featured: z.boolean().default(false),
  /** Controla a visibilidade do produto no catálogo público. */
  active: z.boolean().default(true),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
