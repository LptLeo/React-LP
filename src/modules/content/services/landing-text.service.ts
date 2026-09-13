/**
 * Regras de negócio do Módulo de Conteúdo (textos institucionais da landing).
 *
 * O conteúdo é persistido como um único documento (singleton): a leitura
 * falha com 404 enquanto o admin não cadastra, e a atualização sempre
 * cria/atualiza o registro único.
 */
import { type HydratedDocument } from "mongoose";
import { AppError } from "../../../shared/errors/AppError";
import type { LandingTextDTO } from "../dto/landing-text.dto";
import type { LandingTextDocument } from "../model/landing-text.model";
import {
  getLandingText,
  upsertLandingText,
} from "../repositories/landing-text.repository";

/**
 * Recupera o conteúdo institucional cadastrado da landing.
 *
 * @returns Documento do conteúdo cadastrado.
 * @throws AppError - Se o conteúdo ainda não foi cadastrado (status 404).
 */
export async function getContent(): Promise<
  HydratedDocument<LandingTextDocument>
> {
  const content = await getLandingText();

  if (!content) {
    throw new AppError("Conteúdo ainda não cadastrado.", 404);
  }

  return content;
}

/**
 * Cria ou atualiza o conteúdo institucional da landing (singleton).
 *
 * @param input - Conteúdo completo validado na borda (Zod).
 * @returns Documento do conteúdo persistido após a operação.
 */
export async function updateContent(
  input: LandingTextDTO,
): Promise<HydratedDocument<LandingTextDocument>> {
  return upsertLandingText(input);
}
