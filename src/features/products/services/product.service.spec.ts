/**
 * Testes unitários do serviço de produtos do painel.
 *
 * Mocka `fetch` e `localStorage` (memória) para testar as chamadas de API com
 * token Bearer e serialização de erros.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminProducts,
  updateAdminProduct,
} from "./product.service";

const productPayload = {
  title: "Fone Bluetooth",
  description: "Fone com ótima autonomia de bateria.",
  price: 149.9,
  category: "eletronicos",
  featured: true,
  active: false,
};

function createMemoryStorage(): Storage {
  const map = new Map<string, string>([["react-lp.admin.token", "jwt-token"]]);

  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
    clear: () => map.clear(),
    key: () => null,
    get length() {
      return map.size;
    },
  } as Storage;
}

describe("product.service (painel)", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createMemoryStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lista produtos com token Bearer e com a página correta", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "ok",
        data: {
          items: [productPayload],
          total: 1,
          page: 2,
          limit: 10,
          totalPages: 1,
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const page = await fetchAdminProducts(2, 10);

    expect(page.total).toBe(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/products?page=2&limit=10",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-token",
        }),
      }),
    );
  });

  it("cria um produto via POST com o corpo serializado", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "ok",
        data: {
          _id: "abc123",
          ...productPayload,
          createdAt: "x",
          updatedAt: "x",
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const created = await createAdminProduct(productPayload);

    expect(created._id).toBe("abc123");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/products",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(productPayload),
      }),
    );
  });

  it("atualiza um produto via PUT parcial", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "ok",
        data: {
          _id: "abc123",
          ...productPayload,
          active: true,
          createdAt: "x",
          updatedAt: "x",
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await updateAdminProduct("abc123", { active: true });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/products/abc123",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ active: true }),
      }),
    );
  });

  it("remove um produto via DELETE", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "ok", message: "Produto removido." }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await deleteAdminProduct("abc123");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/products/abc123",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("lança a mensagem do backend em caso de erro", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          status: "error",
          message: "Produto não encontrado.",
        }),
      }),
    );

    await expect(updateAdminProduct("x", { title: "X" })).rejects.toThrow(
      "Produto não encontrado.",
    );
  });

  it("lança a primeira mensagem de validação quando há validation_error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          status: "validation_error",
          errors: { title: ["Título é obrigatório"] },
        }),
      }),
    );

    await expect(
      createAdminProduct({ ...productPayload, title: "" }),
    ).rejects.toThrow("Título é obrigatório");
  });
});
