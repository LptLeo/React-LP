/**
 * Repositório de acesso aos dados de administradores.
 *
 * Todas as leituras excluem o `passwordHash` (nunca trafega em respostas).
 */
import { type HydratedDocument } from "mongoose";
import {
  AdminModel,
  type AdminDocument,
  type AdminRole,
} from "../../auth/model/admin.model";

/** Dados para persistir um novo administrador. */
export interface CreateAdminData {
  email: string;
  passwordHash: string;
  name?: string;
  role: AdminRole;
  active: boolean;
}

/** Campos parciais para atualização de um administrador. */
export interface UpdateAdminData {
  email?: string;
  passwordHash?: string;
  name?: string;
  role?: AdminRole;
  active?: boolean;
}

/**
 * Lista todos os administradores, mais recentes primeiro.
 *
 * @returns Documentos de administradores sem o `passwordHash`.
 */
export async function listAdmins(): Promise<HydratedDocument<AdminDocument>[]> {
  return AdminModel.find().select("-passwordHash").sort({ createdAt: -1 });
}

/**
 * Busca um administrador pelo ID.
 *
 * @param id - ID (ObjectId) do administrador.
 * @returns Documento do administrador ou `null` caso não exista.
 */
export async function findAdminById(
  id: string,
): Promise<HydratedDocument<AdminDocument> | null> {
  return AdminModel.findById(id).select("-passwordHash");
}

/**
 * Busca um administrador pelo e-mail (checagem de duplicidade).
 *
 * @param email - E-mail do administrador.
 * @returns Documento do administrador ou `null` caso não exista.
 */
export async function findAdminByEmail(
  email: string,
): Promise<HydratedDocument<AdminDocument> | null> {
  return AdminModel.findOne({ email: email.toLowerCase() }).select(
    "-passwordHash",
  );
}

/**
 * Persiste um novo administrador.
 *
 * @param data - Dados validados do administrador, com o hash gerado.
 * @returns Documento do administrador criado.
 */
export async function createAdmin(
  data: CreateAdminData,
): Promise<HydratedDocument<AdminDocument>> {
  return AdminModel.create(data);
}

/**
 * Atualiza um administrador pelo ID.
 *
 * @param id - ID (ObjectId) do administrador.
 * @param data - Campos parciais para atualização.
 * @returns Documento atualizado (sem `passwordHash`) ou `null` se não existir.
 */
export async function updateAdmin(
  id: string,
  data: UpdateAdminData,
): Promise<HydratedDocument<AdminDocument> | null> {
  return AdminModel.findByIdAndUpdate(id, data, {
    returnDocument: "after",
    runValidators: true,
  }).select("-passwordHash");
}

/**
 * Remove um administrador pelo ID.
 *
 * @param id - ID (ObjectId) do administrador.
 * @returns Documento removido (sem `passwordHash`) ou `null` se não existir.
 */
export async function deleteAdmin(
  id: string,
): Promise<HydratedDocument<AdminDocument> | null> {
  return AdminModel.findByIdAndDelete(id).select("-passwordHash");
}

/**
 * Conta owners ativos, desconsiderando um administrador específico.
 *
 * @param excludeId - ID do administrador a excluir da contagem.
 * @returns Quantidade de owners ativos restantes.
 */
export async function countActiveOwnersExcluding(
  excludeId: string,
): Promise<number> {
  return AdminModel.countDocuments({
    _id: { $ne: excludeId },
    role: "owner",
    active: true,
  });
}
