/**
 * DTOs e schemas de validação do módulo de Gestão de Administradores.
 *
 * Os schemas usam `.describe()` para autodocumentação e são a fonte de
 * validação na borda HTTP (serverless functions / frontend).
 */
import { z } from "zod";

/** Criação de um novo administrador (papel por padrão `editor`). */
export const createAdminSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nome muito curto (mínimo 2 caracteres)")
      .optional()
      .describe("Nome de exibição do administrador no painel"),
    email: z
      .email("E-mail inválido")
      .describe("E-mail de acesso do administrador"),
    password: z
      .string()
      .min(8, "Senha deve ter no mínimo 8 caracteres")
      .describe("Senha de acesso (armazenada apenas como hash bcrypt)"),
    role: z
      .enum(["owner", "editor"])
      .default("editor")
      .describe("Papel do administrador (owner gerencia administradores)"),
    active: z
      .boolean()
      .default(true)
      .describe("Se o administrador pode acessar o painel"),
  })
  .describe("Payload de criação de um administrador");

/** Atualização parcial de um administrador (todos os campos opcionais). */
export const updateAdminSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nome muito curto (mínimo 2 caracteres)")
      .optional()
      .describe("Novo nome de exibição do administrador"),
    email: z
      .email("E-mail inválido")
      .optional()
      .describe("Novo e-mail de acesso"),
    password: z
      .string()
      .min(8, "Senha deve ter no mínimo 8 caracteres")
      .optional()
      .describe("Reset de senha (opcional)"),
    role: z
      .enum(["owner", "editor"])
      .optional()
      .describe("Novo papel do administrador"),
    active: z
      .boolean()
      .optional()
      .describe("Ativa/desativa o acesso ao painel"),
  })
  .describe("Payload de atualização de um administrador");

/** Parâmetro de rota com o ID do administrador. */
export const adminParamsSchema = z
  .object({
    id: z.string().min(1, "ID do administrador é obrigatório"),
  })
  .describe("Identificador do administrador (ObjectId do MongoDB)");

export type CreateAdminDTO = z.infer<typeof createAdminSchema>;
export type UpdateAdminDTO = z.infer<typeof updateAdminSchema>;
export type AdminParamsDTO = z.infer<typeof adminParamsSchema>;
