/**
 * Regras de negócio do módulo de Autenticação.
 *
 * Lida com o seed do administrador (condicional) e o login com emissão de JWT.
 */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { type HydratedDocument } from "mongoose";
import { env } from "../../../shared/config/env";
import { AppError } from "../../../shared/errors/AppError";
import type { LoginDTO } from "../dto/login.dto";
import type { AdminDocument } from "../model/admin.model";
import { createAdmin, findByEmail } from "../repositories/admin.repository";

const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = "7d";

/**
 * Garante a existência do administrador definido nas variáveis de ambiente.
 *
 * Seed **condicional**: se o e-mail já existir, o registro é devolvido
 * intacto (nunca sobrescreve o hash). O primeiro admin do `.env` nasce com
 * papel `owner`; administradores adicionais são criados via `/api/admins`.
 *
 * @returns Documento do administrador persistido (existente ou recém-criado).
 */
export async function ensureAdmin(): Promise<HydratedDocument<AdminDocument>> {
  const existing = await findByEmail(env.ADMIN_EMAIL);

  if (existing) {
    return existing;
  }

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, SALT_ROUNDS);
  return createAdmin(env.ADMIN_EMAIL, passwordHash);
}

/**
 * Autentica o administrador e emite o token JWT de acesso.
 *
 * @param input - Credenciais `{ email, password }` já validadas na borda (Zod).
 * @returns Objeto com o token JWT assinado (expiração de 7 dias).
 * @throws AppError - Credenciais inválidas ou conta desativada (status 401).
 */
export async function login(input: LoginDTO): Promise<{ token: string }> {
  const admin = await findByEmail(input.email);

  // Mensagem genérica evita revelar a existência de contas desativadas.
  if (!admin || admin.active === false) {
    throw new AppError("Credenciais inválidas.", 401);
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    admin.passwordHash,
  );

  if (!passwordMatches) {
    throw new AppError("Credenciais inválidas.", 401);
  }

  const token = jwt.sign(
    { sub: admin._id.toString(), email: admin.email },
    env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );

  return { token };
}
