/**
 * Regras de negócio do módulo de Gestão de Administradores.
 *
 * Funções puras que validam (Fail Fast) e garantem a segurança: nunca expõem
 * o `passwordHash` e protegem a existência de pelo menos um owner ativo.
 */
import mongoose from "mongoose";
import { type HydratedDocument } from "mongoose";
import bcrypt from "bcryptjs";
import { AppError } from "../../../shared/errors/AppError";
import type { AdminDocument, AdminRole } from "../../auth/model/admin.model";
import type { CreateAdminDTO, UpdateAdminDTO } from "../dto/admin.dto";
import {
  countActiveOwnersExcluding,
  createAdmin as createAdminInDatabase,
  deleteAdmin as deleteAdminInDatabase,
  findAdminByEmail,
  findAdminById,
  listAdmins as listAdminsInDatabase,
  updateAdmin as updateAdminInDatabase,
  type UpdateAdminData,
} from "../repositories/admin.repository";

const SALT_ROUNDS = 10;

/** Administrador serializado para respostas (jamais contém `passwordHash`). */
export interface PublicAdmin {
  _id: string;
  email: string;
  name?: string;
  role: AdminRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Valida se o ID informado é um ObjectId do MongoDB válido (cláusula guarda).
 *
 * @param id - ID do administrador.
 * @throws AppError - Se o ID não for um ObjectId válido (status 400).
 */
function assertValidObjectId(id: string): void {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("ID de administrador inválido.", 400);
  }
}

/**
 * Serializa um documento de administrador sem expor o `passwordHash`.
 *
 * @param doc - Documento Mongoose do administrador.
 * @returns Objeto público com os dados seguros do administrador.
 */
export function sanitizeAdmin(
  doc: HydratedDocument<AdminDocument>,
): PublicAdmin {
  return {
    _id: doc._id.toString(),
    email: doc.email,
    name: doc.name,
    role: doc.role,
    active: doc.active,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * Cria um novo administrador com hash bcrypt.
 *
 * @param input - Dados validados na borda (Zod).
 * @returns Administrador público criado.
 * @throws AppError - Se o e-mail já estiver em uso (status 409).
 */
export async function createAdminAccount(
  input: CreateAdminDTO,
): Promise<PublicAdmin> {
  const existing = await findAdminByEmail(input.email);

  if (existing) {
    throw new AppError("Já existe um administrador com este e-mail.", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const admin = await createAdminInDatabase({
    email: input.email.toLowerCase(),
    name: input.name,
    role: input.role,
    active: input.active,
    passwordHash,
  });

  return sanitizeAdmin(admin);
}

/**
 * Lista todos os administradores (sem `passwordHash`).
 *
 * @returns Array de administradores públicos.
 */
export async function listAdminAccounts(): Promise<PublicAdmin[]> {
  const admins = await listAdminsInDatabase();
  return admins.map(sanitizeAdmin);
}

/**
 * Atualiza parcialmente um administrador pelo ID.
 *
 * Regras de segurança: um owner ativo não pode ser desativado ou rebaixado
 * enquanto for o último owner ativo (evita lockout do painel).
 *
 * @param id - ID (ObjectId) do administrador.
 * @param input - Campos parciais validados na borda (Zod).
 * @returns Administrador público atualizado.
 * @throws AppError - ID inválido (400), inexistente (404) ou último owner (400).
 */
export async function updateAdminAccount(
  id: string,
  input: UpdateAdminDTO,
): Promise<PublicAdmin> {
  assertValidObjectId(id);

  const target = await findAdminById(id);

  if (!target) {
    throw new AppError("Administrador não encontrado.", 404);
  }

  const updateData: UpdateAdminData = {};

  if (input.name !== undefined) {
    updateData.name = input.name;
  }
  if (input.email !== undefined) {
    updateData.email = input.email.toLowerCase();
  }
  if (input.role !== undefined) {
    updateData.role = input.role;
  }
  if (input.active !== undefined) {
    updateData.active = input.active;
  }
  if (input.password !== undefined) {
    updateData.passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  }

  const demotingLastOwner =
    target.role === "owner" &&
    target.active !== false &&
    (input.active === false || input.role === "editor");

  if (demotingLastOwner) {
    const remainingOwners = await countActiveOwnersExcluding(id);

    if (remainingOwners < 1) {
      throw new AppError(
        "Não é possível desativar o último administrador dono.",
        400,
      );
    }
  }

  const updated = await updateAdminInDatabase(id, updateData);

  if (!updated) {
    throw new AppError("Administrador não encontrado.", 404);
  }

  return sanitizeAdmin(updated);
}

/**
 * Remove um administrador pelo ID.
 *
 * Regras de segurança: não é possível remover a si mesmo nem o último owner.
 *
 * @param id - ID (ObjectId) do administrador alvo.
 * @param actorId - ID (ObjectId) do administrador autenticado (owner).
 * @throws AppError - ID inválido (400), auto-remoção (400), inexistente (404)
 * ou último owner (400).
 */
export async function deleteAdminAccount(
  id: string,
  actorId: string,
): Promise<void> {
  assertValidObjectId(id);

  if (id === actorId) {
    throw new AppError("Não é possível remover o próprio administrador.", 400);
  }

  const target = await findAdminById(id);

  if (!target) {
    throw new AppError("Administrador não encontrado.", 404);
  }

  if (target.role === "owner" && target.active !== false) {
    const remainingOwners = await countActiveOwnersExcluding(id);

    if (remainingOwners < 1) {
      throw new AppError(
        "Não é possível remover o último administrador dono.",
        400,
      );
    }
  }

  await deleteAdminInDatabase(id);
}
