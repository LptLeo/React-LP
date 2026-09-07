/**
 * Integração com a API do Cloudinary para envio de mídias.
 *
 * Centraliza a configuração do SDK e expõe helpers de upload/deleção de imagens
 * utilizados pela área administrativa (CRUD de produtos). A configuração lê as
 * credenciais de `env` (validadas por Zod).
 */

import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * Envia uma imagem para o Cloudinary.
 *
 * @param filePath - Caminho local ou URL pública da imagem a ser enviada.
 * @returns Objeto com **secure_url**, `public_id` e demais metadados do Cloudinary.
 * @throws AppError - Caso o upload falhe (status 500).
 */
export async function uploadImage(
  filePath: string,
): Promise<{ secure_url: string; public_id: string }> {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "catalogo",
    });
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } catch {
    throw new AppError("Não foi possível enviar a imagem.", 500);
  }
}

/**
 * Remove uma imagem do Cloudinary pelo seu public_id.
 *
 * @param publicId - Identificador público da imagem no Cloudinary.
 * @returns `true` se a imagem foi removida com sucesso.
 * @throws AppError - Caso a deleção falhe (status 500).
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch {
    throw new AppError("Não foi possível remover a imagem.", 500);
  }
}
