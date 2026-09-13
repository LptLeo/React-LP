/**
 * Function Serverless — Assinatura de Upload.
 *
 * Mapeada para `/api/upload-signature`. Gera uma assinatura **signed** para
 * upload direto de imagem ao Cloudinary (o `api_secret` nunca sai do servidor).
 * Exige Bearer token (painel administrativo autenticado).
 *
 * Fluxo: o painel pede a assinatura (GET), o browser envia o arquivo direto
 * para `api.cloudinary.com` com `timestamp + folder + signature`.
 *
 * @param request - Request HTTP Web standard (Netlify Functions).
 * @returns `Response` JSON com os parâmetros assinados de upload.
 */
import { signUpload } from "../../src/shared/cloudinary/cloudinary";
import { errorHandler } from "../../src/shared/errors/errorHandler";
import { getAuthContext } from "../../src/shared/serverless/authRequired";
import { methodNotAllowed } from "../../src/shared/serverless/http";

export default async (request: Request): Promise<Response> => {
  try {
    if (request.method !== "GET") {
      return methodNotAllowed();
    }

    getAuthContext(request);

    return Response.json({ status: "ok", data: signUpload() });
  } catch (error) {
    return errorHandler(error);
  }
};