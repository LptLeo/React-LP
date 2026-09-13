/**
 * Serviço de upload de imagem de produto (envio direto ao Cloudinary).
 *
 * O navegador não conhece o `api_secret` do Cloudinary. O fluxo é:
 *
 * 1. `GET /api/upload-signature` (Bearer) devolve a **assinatura** (timestamp +
 *    signature + folder) gerada no servidor.
 * 2. O arquivo é enviado direto para `api.cloudinary.com` com essa assinatura
 *    (signed upload), sem o arquivo passar pelo nosso backend.
 */
import { getStoredToken } from "@/features/auth/services/auth.service";

/** Assinatura de upload direto (signed) devolvida pelo backend. */
export interface UploadSignature {
  cloud_name: string;
  api_key: string;
  timestamp: number;
  folder: string;
  signature: string;
  /** Mensagem de erro devolvida pelo backend (ex.: "Não autorizado."). */
  message?: string;
}

/** Resultado do upload de uma imagem de produto. */
export interface UploadedProductImage {
  /** URL segura da imagem no Cloudinary. */
  url: string;
  /** Identificador público (`public_id`) usado para remover a imagem. */
  publicId: string;
}

/**
 * Solicita a assinatura de upload assinado ao backend.
 *
 * @returns Assinatura com `cloud_name`, `api_key`, `timestamp`, `folder` e `signature`.
 * @throws Error - Se a chamada falhar ou não devolver os dados.
 */
async function getUploadSignature(): Promise<UploadSignature> {
  const response = await fetch("/api/upload-signature", {
    headers: { Authorization: `Bearer ${getStoredToken() ?? ""}` },
  });

  const payload = (await response.json()) as UploadSignature;

  if (!response.ok || !payload.signature) {
    throw new Error(
      payload.message ?? "Não foi possível preparar o upload da imagem.",
    );
  }

  return payload;
}

/**
 * Envia a imagem diretamente para o Cloudinary usando a assinatura do backend.
 *
 * @param file - Arquivo de imagem selecionado pelo usuário.
 * @returns Objeto com `url` (secure_url) e `publicId` (public_id).
 * @throws Error - Se o upload falhar (ex: arquivo inválido ou rede).
 */
export async function uploadProductImage(file: File): Promise<UploadedProductImage> {
  const signature = await getUploadSignature();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("cloud_name", signature.cloud_name);
  formData.append("api_key", signature.api_key);
  formData.append("timestamp", String(signature.timestamp));
  formData.append("folder", signature.folder);
  formData.append("signature", signature.signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloud_name}/image/upload`,
    { method: "POST", body: formData },
  );

  const result = (await response.json()) as {
    secure_url?: string;
    public_id?: string;
    error?: { message?: string };
  };

  if (!response.ok || !result.secure_url || !result.public_id) {
    throw new Error(result.error?.message ?? "Não foi possível enviar a imagem.");
  }

  return { url: result.secure_url, publicId: result.public_id };
}