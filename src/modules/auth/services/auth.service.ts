/**
 * Regras de negócio do módulo de Autenticação.
 *
 * Lida com o seed do administrador (idempotente) e o login com emissão de JWT.
 */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { type HydratedDocument } from "mongoose";
import { env } from "../../../shared/config/env";
import { AppError } from "../../../shared/errors/AppError";
import type { LoginDTO } from "../dto/login.dto";
import type { AdminDocument } from "../model/admin.model";
import { findByEmail, upsertAdmin } from "../repositories/admin.repository";

const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = "7d";

/**
 * Garante a existência do administrador definido nas variáveis de ambiente.
 *
 * Seed idempotente: se o e-mail já existir, apenas o hash de senha é atualizado.
 *
 * @returns Documento do administrador persistido.
 * @throws AppError - Caso a persistência falhe (status 500).
 */
export async function ensureAdmin(): Promise<HydratedDocument<AdminDocument>> {
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, SALT_ROUNDS);
  return upsertAdmin(env.ADMIN_EMAIL, passwordHash);
}

/**
 * Autentica o administrador e emite o token JWT de acesso.
 *
 * @param input - Credenciais `{ email, password }` já validadas na borda (Zod).
 * @returns Objeto com o token JWT assinado (expiração de 7 dias).
 * @throws AppError - Se as credenciais forem inválidas (status 401).
 */
export async function login(input: LoginDTO): Promise<{ token: string }> {
  const admin = await findByEmail(input.email);

  if (!admin) {
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
