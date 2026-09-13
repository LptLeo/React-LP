/**
 * Repositório de acesso ao conteúdo institucional da landing page.
 *
 * Mantém um único documento (singleton) na coleção `landingtexts`.
 */
import { type HydratedDocument } from "mongoose";
import { AppError } from "../../../shared/errors/AppError";
import type { LandingTextDTO } from "../dto/landing-text.dto";
import {
  LandingTextModel,
  type LandingTextDocument,
} from "../model/landing-text.model";

/**
 * Busca o documento único do conteúdo da landing.
 *
 * @returns Documento de conteúdo ou `null` caso ainda não cadastrado.
 */
export async function getLandingText(): Promise<HydratedDocument<LandingTextDocument> | null> {
  return LandingTextModel.findOne();
}

/**
 * Persiste o conteúdo da landing como documento único (create-if-missing).
 *
 * Usa `upsert` com filtro vazio: cria o primeiro documento se não existir e
 * atualiza em chamadas seguintes, garantindo o singleton.
 *
 * @param data - Conteúdo validado (Zod) da landing.
 * @returns Documento persistido após a operação.
 * @throws AppError - Caso a persistência falhe (status 500).
 */
export async function upsertLandingText(
  data: LandingTextDTO,
): Promise<HydratedDocument<LandingTextDocument>> {
  const doc = await LandingTextModel.findOneAndUpdate({}, data, {
    upsert: true,
    returnDocument: "after",
    runValidators: true,
    setDefaultsOnInsert: true,
  });

  if (!doc) {
    throw new AppError("Não foi possível persistir o conteúdo.", 500);
  }

  return doc;
}
