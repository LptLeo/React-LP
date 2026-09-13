/**
 * Serverless Function — Autenticação.
 *
 * Mapeada para `POST /api/auth/login`. Autentica o administrador com validação
 * Zod e devolve o token JWT.
 *
 * @param request - Request HTTP Web standard (Netlify Functions).
 * @returns `Response` JSON com o token JWT ou erro estruturado.
 */
import { loginSchema } from "../../src/modules/auth/dto/login.dto";
import {
  ensureAdmin,
  login,
} from "../../src/modules/auth/services/auth.service";
import { connectDatabase } from "../../src/shared/database/mongo";
import { errorHandler } from "../../src/shared/errors/errorHandler";
import {
  methodNotAllowed,
  readJsonBody,
} from "../../src/shared/serverless/http";

export default async (request: Request): Promise<Response> => {
  try {
    if (request.method !== "POST") {
      return methodNotAllowed();
    }

    await connectDatabase();
    await ensureAdmin();

    const body = await readJsonBody(request);

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
