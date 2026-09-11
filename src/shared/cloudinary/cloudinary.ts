/**
 * Integração com a API do Cloudinary para envio de mídias.
 *
 * Centraliza a configuração do SDK e expõe helpers de upload/deleção de imagens
 * utilizados pela área administrativa (CRUD de produtos). A configuração lê as
 * credenciais de `env` (validadas por Zod).
 */

import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * Assinatura de upload direto (signed upload) para o browser.
 *
 * Como o `api_secret` não pode trafegar para o cliente, o painel solicita uma
 * assinatura ao backend (`/api/upload-signature`) e envia o arquivo direto
 * para o Cloudinary com essa assinatura.
 */
export interface UploadSignature {
  /** Cloud name do ambiente. */
  cloud_name: string;
  /** API Key público (seguro de expor ao client). */
  api_key: string;
  /** Timestamp (epoch segundos) usado na assinatura. */
  timestamp: number;
  /** Pasta de destino dos uploads. */
  folder: string;
  /** Assinatura HMAC-SHA1 dos parâmetros. */
  signature: string;
}

/**
 * Gera uma assinatura de upload assinado (signed) para o navegador.
 *
 * O upload é feito pelo browser direto para `api.cloudinary.com`, então a
 * assinatura precisa incluir `timestamp` + `folder` (os parâmetros que serão
 * enviados). O `api_secret` permanece apenas no servidor.
 *
 * @returns Assinatura com os parâmetros para o upload direto.
 */
export function signUpload(): UploadSignature {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = "catalogo";

  const signature = cloudinary.utils.api_sign_request(
    { timestamp: String(timestamp), folder },
    env.CLOUDINARY_API_SECRET,
  ) as string;

  return {
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    timestamp,
    folder,
    signature,
  };
}

/** Assinatura de upload direto (signed upload) para uso no navegador. */
export interface UploadSignature {
  /** Nome do cloud (Cloudinary) destino. */
  cloud_name: string;
  /** API Key do cloud (pública, enviada no upload). */
  api_key: string;
  /** Timestamp (segundos) usado na assinatura. */
  timestamp: number;
  /** Assinatura HMAC dos parâmetros de upload. */
  signature: string;
  /** Pasta de destino no Cloudinary. */
  folder: string;
}

/**
 * Gera uma assinatura de upload direto (signed upload).
 *
 * O navegador não conhece o `api_secret`; a assinatura é criada no backend
 * para autorizar o envio direto do arquivo para a API do Cloudinary.
 *
 * @returns Parâmetros assinados necessários para `POST /v1_1/.../image/upload`.
 */
