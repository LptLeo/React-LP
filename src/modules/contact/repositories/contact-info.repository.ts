/**
 * Repositório de acesso aos dados de contato do site.
 *
 * Mantém um único documento (singleton) na coleção `contactinfos`.
 */
import { type HydratedDocument } from "mongoose";
import { AppError } from "../../../shared/errors/AppError";
import type { ContactInfoDTO } from "../dto/contact-info.dto";
import {
  ContactInfoModel,
  type ContactInfoDocument,
} from "../model/contact-info.model";

/**
 * Busca o documento único dos dados de contato.
 *
 * @returns Documento de contato ou `null` caso ainda não cadastrado.
 */
export async function getContactInfo(): Promise<HydratedDocument<ContactInfoDocument> | null> {
  return ContactInfoModel.findOne();
}

/**
 * Persiste os dados de contato como documento único (create-if-missing).
 *
 * Usa `upsert` com filtro vazio: cria o primeiro documento se não existir e
 * atualiza em chamadas seguintes, garantindo o singleton.
 *
 * @param data - Dados de contato validados (Zod).
 * @returns Documento persistido após a operação.
 * @throws AppError - Caso a persistência falhe (status 500).
 */
export async function upsertContactInfo(
  data: ContactInfoDTO,
): Promise<HydratedDocument<ContactInfoDocument>> {
  const doc = await ContactInfoModel.findOneAndUpdate({}, data, {
    upsert: true,
    returnDocument: "after",
    runValidators: true,
    setDefaultsOnInsert: true,
  });

  if (!doc) {
    throw new AppError("Não foi possível persistir os dados de contato.", 500);
  }

  return doc;
}
