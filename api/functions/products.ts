/**
 * Serverless Function — Produtos.
 *
 * Mapeada para `/api/products*`. Expõe o CRUD do catálogo: `GET` público
 * (lista paginada com filtros ou item via `/api/products/{id}`) e
 * `POST`/`PUT`/`DELETE` protegidos por JWT Bearer.
 *
 * @param request - Request HTTP Web standard (Netlify Functions).
 * @returns `Response` JSON com o resultado da operação ou erro estruturado.
 */
import {
  createProductSchema,
  productListQuerySchema,
  updateProductSchema,
} from "../../src/modules/products/dto/product.dto";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from "../../src/modules/products/services/product.service";
import { connectDatabase } from "../../src/shared/database/mongo";
import { errorHandler } from "../../src/shared/errors/errorHandler";
import { getAuthContext } from "../../src/shared/serverless/authRequired";
import {
  methodNotAllowed,
  readJsonBody,
} from "../../src/shared/serverless/http";

export default async (request: Request): Promise<Response> => {
  try {
    await connectDatabase();

    const url = new URL(request.url);
    const segments = url.pathname.split("/").filter(Boolean);

    if (segments[1] !== "products") {
      return Response.json(
        { status: "error", message: "Rota não encontrada" },
        { status: 404 },
      );
    }

    const id = segments[2];

    switch (request.method) {
      case "GET": {
        // Item único: /api/products/{id}
        if (id) {
          const product = await getProductById(id);
          return Response.json({ status: "ok", data: product });
        }

        // Lista paginada: /api/products
        const queryParams = Object.fromEntries(url.searchParams);
        const parsed = productListQuerySchema.safeParse(queryParams);

        if (!parsed.success) {
          return errorHandler(parsed.error);
        }

        const page = await listProducts(parsed.data);
        return Response.json({ status: "ok", data: page });
      }

      case "POST": {
        if (id) {
          return methodNotAllowed();
        }

        getAuthContext(request);
        const body = await readJsonBody(request);
        const parsed = createProductSchema.safeParse(body);

        if (!parsed.success) {
          return errorHandler(parsed.error);
        }

        const product = await createProduct(parsed.data);
        return Response.json({ status: "ok", data: product }, { status: 201 });
      }

      case "PUT": {
        if (!id) {
          return methodNotAllowed();
        }

        getAuthContext(request);
        const body = await readJsonBody(request);
        const parsed = updateProductSchema.safeParse(body);

        if (!parsed.success) {
          return errorHandler(parsed.error);
        }

        const product = await updateProduct(id, parsed.data);
        return Response.json({ status: "ok", data: product });
      }

      case "DELETE": {
        if (!id) {
          return methodNotAllowed();
        }

        getAuthContext(request);
        await deleteProduct(id);
        return Response.json({ status: "ok", message: "Produto removido." });
      }

      default:
        return methodNotAllowed();
    }
  } catch (error) {
    return errorHandler(error);
  }
};
