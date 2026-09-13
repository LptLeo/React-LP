/**
 * Middleware/autorização de rotas administrativas exclusivas para owners.
 *
 * Valida o JWT na borda e busca o administrador no banco para checar, em tempo
 * real, o estado da conta (revogação imediata) e o papel (`owner`).
 */
import { type HydratedDocument } from "mongoose";
import { AppError } from "../../../shared/errors/AppError";
import { getAuthContext } from "../../../shared/serverless/authRequired";
import { AdminModel, type AdminDocument } from "../../auth/model/admin.model";

/**
 * Exige um administrador autenticado com papel `owner` e conta ativa.
 *
 * @param request - Request HTTP Web standard.
 * @returns Documento do administrador owner autenticado.
 * @throws AppError - Token ausente/inválido (401), conta inexistente ou
 * desativada (401) ou papel sem permissão (403).
 */
export async function requireOwner(
  request: Request,
): Promise<HydratedDocument<AdminDocument>> {
  const { adminId } = getAuthContext(request);

  const admin = await AdminModel.findById(adminId);

  if (!admin || admin.active === false) {
    throw new AppError("Credenciais inválidas.", 401);
  }

  if (admin.role !== "owner") {
    throw new AppError(
      "Acesso restrito a administradores com papel de dono.",
      403,
    );
  }

  return admin;
}
