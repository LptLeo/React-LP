/**
 * Repositório de acesso aos dados do administrador.
 */
import { type HydratedDocument } from "mongoose";
import {
  AdminModel,
  type AdminDocument,
  type AdminRole,
} from "../model/admin.model";

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
 * Persiste um novo administrador (seed único do `.env`).
 *
 * O upsert foi substituído por insert puro: um admin já existente **nunca** é
 * sobrescrito (remove o backdoor de redefinição de senha via variável de
 * ambiente depois da primeira inicialização).
 *
 * @param email - E-mail do administrador.
 * @param passwordHash - Hash bcrypt da senha.
 * @param role - Papel do administrador (o seed nasce como `owner`).
 * @returns Documento do administrador persistido.
 * @throws AppError - Caso a persistência falhe (status 500).
 */
export async function createAdmin(
  email: string,
  passwordHash: string,
  role: AdminRole = "owner",
): Promise<HydratedDocument<AdminDocument>> {
  return AdminModel.create({ email, passwordHash, role });
}
