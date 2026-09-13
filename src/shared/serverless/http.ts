/**
 * Helpers HTTP compartilhados das Serverless Functions.
 */
import { AppError } from "../errors/AppError";

/**
 * Lê o corpo JSON da requisição.
 *
 * @param request - Request HTTP a ser lido.
 * @returns Objeto JSON desconhecido (a validação Zod acontece na borda de uso).
 * @throws AppError - Se o body não for um JSON válido (status 400).
 */
export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new AppError("Body JSON inválido.", 400);
  }
}

/**
 * Retorna a resposta padronizada de método não permitido.
 *
 * @returns `Response` JSON com status 405.
 */
export function methodNotAllowed(): Response {
  return Response.json(
    { status: "error", message: "Método não permitido" },
    { status: 405 },
  );
}
