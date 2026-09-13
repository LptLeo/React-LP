/**
 * Helper de autenticação para Serverless Functions.
 *
 * Extrai e valida o token JWT (Bearer) de uma requisição Web standard,
 * devolvendo os dados do administrador autenticado.
 */
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";

export interface AuthContext {
  /** Identificador do administrador (`sub` do JWT). */
  adminId: string;
  /** E-mail do administrador autenticado. */
  email: string;
}

/**
 * Valida o header `Authorization` (Bearer token) de uma requisição.
 *
 * @param request - Request Web standard (Netlify Functions).
 * @returns Contexto de autenticação com `adminId` e `email`.
 * @throws AppError - Sem token (401) ou token inválido/expirado (401).
 */
export function getAuthContext(request: Request): AuthContext {
  const header = request.headers.get("authorization");

  if (!header?.startsWith("Bearer ")) {
    throw new AppError("Token de autenticação ausente.", 401);
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);

    if (
      typeof payload !== "object" ||
      payload === null ||
      !("sub" in payload) ||
      !("email" in payload)
    ) {
      throw new AppError("Token inválido.", 401);
    }

    const { sub, email } = payload as { sub: string; email: string };

    return { adminId: sub, email };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Token inválido ou expirado.", 401);
  }
}

/**
 * Valida o header `Authorization` de forma opcional.
 *
 * Retorna `null` quando não há token (acesso anônimo) e delega ao
 * `getAuthContext` para validar o token quando presente.
 *
 * @param request - Request Web standard (Netlify Functions).
 * @returns Contexto de autenticação ou `null` quando o acesso é anônimo.
 * @throws AppError - Token presente mas inválido/expirado (401).
 */
export function getOptionalAuthContext(request: Request): AuthContext | null {
  const header = request.headers.get("authorization");

  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  return getAuthContext(request);
}
