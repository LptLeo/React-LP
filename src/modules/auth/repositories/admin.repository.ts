/**
 * Repositório de acesso aos dados do administrador.
 */
import { AppError } from "../../../shared/errors/AppError";
import { type HydratedDocument } from "mongoose";
import { AdminModel, type AdminDocument } from "../model/admin.model";

/**
 * Busca um administrador pelo e-mail no repositório.
 *
 * @param email - E-mail exato do administrador (case-insensitive).
 * @returns Documento do administrador encontrado ou `null` caso não exista.
 */
export async function findByEmail(
  email: string,
): Promise<HydratedDocument<AdminDocument> | null> {
  return AdminModel.findOne({ email: email.toLowerCase() });
}

/**
 * Insere ou atualiza o administrador (seed idempotente) a partir do `.env`.
 *
 * Se o e-mail já existir, apenas o hash de senha é atualizado.
 *
 * @param email - E-mail do administrador.
 * @param passwordHash - Hash bcrypt da senha.
 * @returns Documento do administrador persistido.
 * @throws AppError - Caso a persistência falhe (status 500).
 */
export async function upsertAdmin(
  email: string,
  passwordHash: string,
): Promise<HydratedDocument<AdminDocument>> {
  const admin = await AdminModel.findOneAndUpdate(
    { email: email.toLowerCase() },
    { email, passwordHash },
    {
      upsert: true,
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  if (!admin) {
    throw new AppError("Não foi possível persistir o administrador.", 500);
  }

  return admin;
}
