/**
 * Tratador de erro global para as Serverless Functions.
 *
 * Traduz exceções de negócio (`AppError`), erros de validação (`ZodError`) e
 * erros inesperados em um `Response` Web standard (Netlify Functions / Edge).
 *
 * @param error - Erro capturado na function.
 * @returns `Response` JSON com o payload de erro apropriado.
 */
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";

export function errorHandler(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json(
      { status: "error", message: error.message },
      { status: error.statusCode },
    );
  }

  if (error instanceof ZodError) {
    return Response.json(
      { status: "validation_error", errors: error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  console.error(error);
  return Response.json(
    { status: "error", message: "Erro interno do servidor" },
    { status: 500 },
  );
}
