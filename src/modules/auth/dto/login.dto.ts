/**
 * DTO e schema de validação do login da área administrativa.
 */
import { z } from "zod";

export const loginSchema = z
  .object({
    /** E-mail do administrador. */
    email: z.email("E-mail inválido"),
    /** Senha do administrador. */
    password: z.string().min(1, "Senha é obrigatória"),
  })
  .describe("Credenciais de acesso do administrador");

export type LoginDTO = z.infer<typeof loginSchema>;
