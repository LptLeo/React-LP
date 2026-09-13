/**
 * Carregamento e validação das variáveis de ambiente do servidor.
 *
 * Lê as variáveis de `process.env` (com suporte a `.env` via `dotenv`) e valida
 * com Zod, aplicando *fail fast* na borda da aplicação. O objeto `env` exportado
 * é totalmente tipado — evita `any` e erros de configuração em runtime.
 *
 * @throws AppError - Caso alguma variável obrigatória esteja ausente ou inválida (status 500).
 */
import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  /** Porta do servidor (default 3333). */
  PORT: z.coerce.number().default(3333),
  /** String de conexão do MongoDB Atlas. */
  MONGODB_URI: z.string().min(1, "MONGODB_URI é obrigatória"),
  /** Segredo para assinar o token JWT da área administrativa. */
  JWT_SECRET: z.string().min(1, "JWT_SECRET é obrigatória"),
  /** E-mail do administrador (primeiro acesso / seed). */
  ADMIN_EMAIL: z.string().email("ADMIN_EMAIL deve ser um e-mail válido"),
  /** Senha do administrador. */
  ADMIN_PASSWORD: z.string().min(1, "ADMIN_PASSWORD é obrigatória"),
  /** Nome do Cloud (Cloudinary). */
  CLOUDINARY_CLOUD_NAME: z
    .string()
    .min(1, "CLOUDINARY_CLOUD_NAME é obrigatório"),
  /** API Key do Cloudinary. */
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY é obrigatória"),
  /** API Secret do Cloudinary. */
  CLOUDINARY_API_SECRET: z
    .string()
    .min(1, "CLOUDINARY_API_SECRET é obrigatório"),
});

export const env = envSchema.parse(process.env);

export type Env = typeof env;
