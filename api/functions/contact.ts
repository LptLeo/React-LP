/**
 * Serverless Function — Módulo de Contato.
 *
 * Mapeada para `/api/contact`. Expõe a leitura pública dos dados de contato
 * (WhatsApp, e-mail, redes sociais e template de mensagem) e a atualização
 * gerenciada (Bearer token), persistindo tudo como documento único (singleton).
 *
 * @param request - Request HTTP Web standard (Netlify Functions).
 * @returns `Response` JSON com o resultado da operação ou erro estruturado.
 */
import { contactInfoSchema } from "../../src/modules/contact/dto/contact-info.dto";
import {
  getContact,
  updateContact,
} from "../../src/modules/contact/services/contact-info.service";
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

    if (segments[1] !== "contact" || segments[2]) {
      return methodNotAllowed();
    }

    switch (request.method) {
      case "GET": {
        const contact = await getContact();
        return Response.json({ status: "ok", data: contact });
      }

      case "PUT": {
        // Qualquer admin autenticado (owner ou editor) gerencia o contato.
        getAuthContext(request);

        const body = await readJsonBody(request);
        const parsed = contactInfoSchema.safeParse(body);

        if (!parsed.success) {
          return errorHandler(parsed.error);
        }

        const contact = await updateContact(parsed.data);
        return Response.json({ status: "ok", data: contact });
      }

      default:
        return methodNotAllowed();
    }
  } catch (error) {
    return errorHandler(error);
  }
};
