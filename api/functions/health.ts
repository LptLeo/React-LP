/**
 * Serverless Function — Health Check.
 *
 * Mapeada para `GET /api/health`. Valida o carregamento de variáveis de
 * ambiente e a conexão com o MongoDB, retornando o status da API.
 *
 * @returns `Response` JSON com o status do serviço.
 */
import { env } from "../../src/shared/config/env";
import { connectDatabase } from "../../src/shared/database/mongo";
import { errorHandler } from "../../src/shared/errors/errorHandler";

export default async (): Promise<Response> => {
  try {
    await connectDatabase();
    return Response.json({
      status: "ok",
      service: "catalogo-api",
      region: env.CLOUDINARY_CLOUD_NAME ? "configured" : "missing",
      database: "connected",
    });
  } catch (error) {
    return errorHandler(error);
  }
};
