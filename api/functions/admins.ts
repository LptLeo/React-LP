/**
 * Serverless Function — Gestão de Administradores.
 *
 * Mapeada para `/api/admins*`. Expõe o CRUD de administradores (multi-admin),
 * restrito a contas autenticadas com papel `owner`. Listagem, criação,
 * atualização (inclui reset de senha) e remoção nas respostas nunca expõem
 * o `passwordHash`.
 *
 * @param request - Request HTTP Web standard (Netlify Functions).
 * @returns `Response` JSON com o resultado da operação ou erro estruturado.
 */
import {
  createAdminSchema,
  updateAdminSchema,
} from "../../src/modules/admins/dto/admin.dto";
import {
  createAdminAccount,
  deleteAdminAccount,
  listAdminAccounts,
  updateAdminAccount,
} from "../../src/modules/admins/services/admin.service";
import { requireOwner } from "../../src/modules/admins/services/require-owner";
import { connectDatabase } from "../../src/shared/database/mongo";
import { errorHandler } from "../../src/shared/errors/errorHandler";
import {
  methodNotAllowed,
  readJsonBody,
} from "../../src/shared/serverless/http";

export default async (request: Request): Promise<Response> => {
  try {
    await connectDatabase();

    const url = new URL(request.url);
    const segments = url.pathname.split("/").filter(Boolean);

    if (segments[1] !== "admins") {
      return Response.json(
        { status: "error", message: "Rota não encontrada" },
        { status: 404 },
      );
    }

    // Toda operação exige um owner autenticado (checagem em tempo real no banco).
    const owner = await requireOwner(request);
    const id = segments[2];

    switch (request.method) {
      case "GET": {
        if (id) {
          return methodNotAllowed();
        }

        const admins = await listAdminAccounts();
        return Response.json({ status: "ok", data: admins });
      }

      case "POST": {
        if (id) {
          return methodNotAllowed();
        }

        const body = await readJsonBody(request);
        const parsed = createAdminSchema.safeParse(body);

        if (!parsed.success) {
          return errorHandler(parsed.error);
        }

        const admin = await createAdminAccount(parsed.data);
        return Response.json({ status: "ok", data: admin }, { status: 201 });
      }

      case "PUT": {
        if (!id) {
          return methodNotAllowed();
        }

        const body = await readJsonBody(request);
        const parsed = updateAdminSchema.safeParse(body);

        if (!parsed.success) {
          return errorHandler(parsed.error);
        }

        const admin = await updateAdminAccount(id, parsed.data);
        return Response.json({ status: "ok", data: admin });
      }

      case "DELETE": {
        if (!id) {
          return methodNotAllowed();
        }

        await deleteAdminAccount(id, owner._id.toString());
        return Response.json({
          status: "ok",
          message: "Administrador removido.",
        });
      }

      default:
        return methodNotAllowed();
    }
  } catch (error) {
    return errorHandler(error);
  }
};
