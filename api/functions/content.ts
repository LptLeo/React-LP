/**
 * Serverless Function — Módulo de Conteúdo.
 *
 * Mapeada para `/api/content`. Expõe a leitura pública dos textos
 * institucionais (hero, benefícios, FAQ e CTA) e a atualização gerenciada
 * (Bearer token), persistindo o conteúdo como documento único (singleton).
 *
 * @param request - Request HTTP Web standard (Netlify Functions).
 * @returns `Response` JSON com o resultado da operação ou erro estruturado.
 */
import { landingTextSchema } from "../../src/modules/content/dto/landing-text.dto";
import {
  getContent,
  updateContent,
} from "../../src/modules/content/services/landing-text.service";
import { connectDatabase } from "../../src/shared/database/mongo";
import { errorHandler } from "../../src/shared/errors/errorHandler";
import { getAuthContext } from "../../src/shared/serverless/authRequired";
import {
  methodNotAllowed,
  readJsonBody,
} from "../../src/shared/serverless/http";

export default async (request: Request): Promise<Response> => {
  try {
    await connectDatabase();

    const url = new URL(request.url);
    const segments = url.pathname.split("/").filter(Boolean);

    if (segments[1] !== "content" || segments[2]) {
      return methodNotAllowed();
    }

    switch (request.method) {
      case "GET": {
        const content = await getContent();
        return Response.json({ status: "ok", data: content });
      }

      case "PUT": {
        // Qualquer admin autenticado (owner ou editor) gerencia o conteúdo.
        getAuthContext(request);

        const body = await readJsonBody(request);
        const parsed = landingTextSchema.safeParse(body);

        if (!parsed.success) {
          return errorHandler(parsed.error);
        }

        const content = await updateContent(parsed.data);
        return Response.json({ status: "ok", data: content });
      }

      default:
        return methodNotAllowed();
    }
  } catch (error) {
    return errorHandler(error);
  }
};
