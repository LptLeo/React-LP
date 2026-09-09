/**
 * Serverless Function — Autenticação.
 *
 * Exposta em `/.netlify/functions/auth` (POST). Autentica o administrador com
 * validação Zod e devolve o token JWT.
 *
 * @param request - Request HTTP da Netlify Functions.
 * @returns `Response` JSON com o token JWT ou erro estruturado.
 */
import { loginSchema } from "../../src/modules/auth/dto/login.dto";
import {
  ensureAdmin,
  login,
} from "../../src/modules/auth/services/auth.service";
import { connectDatabase } from "../../src/shared/database/mongo";
import { errorHandler } from "../../src/shared/errors/errorHandler";

export default async (request: Request): Promise<Response> => {
  try {
    if (request.method !== "POST") {
      return Response.json(
        { status: "error", message: "Método não permitido" },
        { status: 405 },
      );
    }

    await connectDatabase();
    await ensureAdmin();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { status: "error", message: "Body JSON inválido" },
        { status: 400 },
      );
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return errorHandler(parsed.error);
    }

    const { token } = await login(parsed.data);
    return Response.json({ status: "ok", data: { token } });
  } catch (error) {
    return errorHandler(error);
  }
};
