/**
 * Testes dos schemas de Produtos (DTOs Zod).
 */
import { describe, expect, it } from "vitest";
import { createProductSchema, updateProductSchema } from "./product.dto";

describe("createProductSchema", () => {
  it("valida um produto completo válido", () => {
    const result = createProductSchema.safeParse({
      title: "Fone Bluetooth",
      description: "Fone sem fio com bateria de 30h e cancelamento de ruído.",
      price: 249.9,
      priceOriginal: 329.9,
      category: "eletronicos",
      featured: true,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.featured).toBe(true);
      expect(result.data.active).toBe(true);
    }
  });

  it("aplica defaults para featured/active", () => {
    const result = createProductSchema.safeParse({
      title: "Suporte para celular",
      description:
        "Suporte de mesa com ajuste de ângulo e base antiderrapante.",
      price: 19.9,
      category: "acessorios",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.featured).toBe(false);
      expect(result.data.active).toBe(true);
    }
  });

  it("rejeita preço zero ou negativo", () => {
    const result = createProductSchema.safeParse({
      title: "Fone",
      description: "Fone sem fio com ótima qualidade de áudio.",
      price: 0,
      category: "eletronicos",
    });

    expect(result.success).toBe(false);
  });

  it("rejeita título curto", () => {
    const result = createProductSchema.safeParse({
      title: "F",
      description: "Fone sem fio com ótima qualidade de áudio.",
      price: 99,
      category: "eletronicos",
    });

    expect(result.success).toBe(false);
  });
});

describe("updateProductSchema", () => {
  it("permite atualização parcial (apenas preço)", () => {
    const result = updateProductSchema.safeParse({ price: 199 });

    expect(result.success).toBe(true);
  });
});
