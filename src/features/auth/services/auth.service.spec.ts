/**
 * Testes unitários do serviço de autenticação do painel.
 *
 * Usa mock do `fetch` global e do `localStorage` (memória) para não depender
 * do navegador nem da API.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearStoredToken,
  getStoredToken,
  login,
  TOKEN_STORAGE_KEY,
} from "./auth.service";

/** Cria um `Storage` em memória para simular o `localStorage`. */
function createMemoryStorage(): Storage {
  const map = new Map<string, string>();

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

describe("auth.service", () => {
  beforeEach(() => {
    const storage = createMemoryStorage();
    vi.stubGlobal("localStorage", storage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("retorna null quando não há token armazenado", () => {
    expect(getStoredToken()).toBeNull();
  });

  it("loga e persiste o token JWT no localStorage", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: "ok", data: { token: "jwt-token" } }),
      }),
    );

    const token = await login({
      email: "admin@exemplo.com",
      password: "senha-forte",
    });

    expect(token).toBe("jwt-token");
    expect(getStoredToken()).toBe("jwt-token");
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe("jwt-token");
  });

  it("lança erro com a mensagem da API quando o login é rejeitado", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          status: "error",
          message: "Credenciais inválidas.",
        }),
      }),
    );

    await expect(
      login({ email: "admin@exemplo.com", password: "errada" }),
    ).rejects.toThrow("Credenciais inválidas.");
    expect(getStoredToken()).toBeNull();
  });

  it("lança erro amigável quando a resposta não traz token", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: "ok", data: {} }),
      }),
    );

    await expect(
      login({ email: "admin@exemplo.com", password: "senha-forte" }),
    ).rejects.toThrow("Não foi possível entrar. Tente novamente.");
  });

  it("remove o token no logout (clearStoredToken)", () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, "jwt-token");

    clearStoredToken();

    expect(getStoredToken()).toBeNull();
  });
});
