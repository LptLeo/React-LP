/**
 * Schemas de validação de formulários do módulo de Autenticação.
 */
import { z } from "zod";

export const loginSchema = z.object({
  /** E-mail do administrador. */
  email: z.email("E-mail inválido").describe("E-mail do administrador"),
  /** Senha de acesso do administrador. */
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .describe("Senha de acesso"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
