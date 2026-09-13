/**
 * Testes do serviço de upload de imagem de produto (Cloudinary).
 *
 * Cobre o fluxo: requisição de assinatura (via endpoint de função Serverless)
 * → envio **direto** para o Cloudinary em modo assinado → retorno com os
 * parâmetros da imagem persistida (`publicId` + `url`).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { uploadProductImage } from "@/features/products/services/upload.service";
import type { AdminProductImage } from "@/features/products/services/product.service";

/** Resposta simulada do endpoint `GET /api/upload-signature`. */

/**
 * Stub de `localStorage` (token de sessão do admin) para o ambiente Node
 * do vitest — o serviço monta o header `Bearer` a partir daqui.
 */
beforeEach(() => {
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: () => null,
    get length() {
      return store.size;
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});
const fakeSignature = {
  cloud_name: "demo",
  folder: "products",
  timestamp: 1_700_000_000,
  signature: "assinatura_falsa",
  api_key: "chave_publica",
};

/** Resposta simulada do Cloudinary (upload direto bem-sucedido). */
const fakeUploadResponse = {
  public_id: "products/abc123",
  secure_url:
    "https://res.cloudinary.com/demo/image/upload/v1/products/abc123.jpg",
};

describe("uploadProductImage", () => {
  it("assina, envia direto ao Cloudinary e devolve a imagem persistida", async () => {
    const globalFetch = vi.spyOn(globalThis, "fetch");
    const requestMock = vi.fn<typeof fetch>();

    // 1ª chamada: assinatura (endpoint das funções Netlify)
    requestMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify(fakeSignature), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      // 2ª chamada: upload direto para `api.cloudinary.com`
      .mockResolvedValueOnce(
        new Response(JSON.stringify(fakeUploadResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    globalFetch.mockImplementation(requestMock);

    const file = new File(["conteúdo da imagem"], "produto.jpg", {
      type: "image/jpeg",
    });

    const result = await uploadProductImage(file);

    expect(requestMock).toHaveBeenCalledTimes(2);

    // 1ª: assinatura autenticada via função serverless
    expect(requestMock.mock.calls[0]?.[0]).toBe("/api/upload-signature");
    // 2ª: destino direto e assinado no Cloudinary
    const directUrl = String(requestMock.mock.calls[1]?.[0]);
    expect(directUrl).toContain(
      "https://api.cloudinary.com/v1_1/demo/image/upload",
    );
    const directInit = requestMock.mock.calls[1]?.[1] as RequestInit;
    expect(String(directInit.method)).toMatch(/^post$/i);

    expect(result).toMatchObject<ResultShape>({
      publicId: fakeUploadResponse.public_id,
      url: fakeUploadResponse.secure_url,
    });
    globalFetch.mockRestore();
  });

  it("rejeita propagando a mensagem da API quando a assinatura falha", async () => {
    const globalFetch = vi.spyOn(globalThis, "fetch");
    globalFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Não autorizado." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const file = new File(["x"], "falha.jpg", { type: "image/jpeg" });

    await expect(uploadProductImage(file)).rejects.toThrow(/não autorizado/i);

    globalFetch.mockRestore();
  });
});

/** Forma do retorno esperado do serviço de upload. */
type ResultShape = Pick<AdminProductImage, "publicId" | "url">;
