/**
 * Regras de negócio do Módulo de Contato.
 *
 * Os dados de contato (WhatsApp, e-mail, redes sociais e template de mensagem)
 * são persistidos como um único documento (singleton): a leitura falha com 404
 * enquanto o admin não cadastra, e a atualização sempre cria/atualiza o
 * registro único.
 */
import { type HydratedDocument } from "mongoose";
import { AppError } from "../../../shared/errors/AppError";
import type { ContactInfoDTO } from "../dto/contact-info.dto";
import type { ContactInfoDocument } from "../model/contact-info.model";
import {
  getContactInfo,
  upsertContactInfo,
} from "../repositories/contact-info.repository";

/**
 * Recupera os dados de contato cadastrados do site.
 *
 * @returns Documento dos dados de contato cadastrados.
 * @throws AppError - Se os dados de contato ainda não foram cadastrados
 * (status 404).
 */
export async function getContact(): Promise<
  HydratedDocument<ContactInfoDocument>
> {
  const contact = await getContactInfo();

  if (!contact) {
    throw new AppError("Dados de contato ainda não cadastrados.", 404);
  }

  return contact;
}

/**
 * Cria ou atualiza os dados de contato do site (singleton).
 *
 * @param input - Dados de contato completos validados na borda (Zod).
 * @returns Documento dos dados de contato persistidos após a operação.
 */
export async function updateContact(
  input: ContactInfoDTO,
): Promise<HydratedDocument<ContactInfoDocument>> {
  return upsertContactInfo(input);
}
