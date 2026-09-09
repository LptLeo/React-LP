/**
 * Testes unitários do serviço de Conteúdo (textos institucionais).
 *
 * Usa `mongodb-memory-server` para não depender do MongoDB local.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import type { LandingTextDTO } from "../dto/landing-text.dto";
import { getContent, updateContent } from "./landing-text.service";

const baseInput: LandingTextDTO = {
  heroTitle: "Catálogo digital",
  heroSubtitle: "Venda direto pelo WhatsApp",
  benefits: [
    { icon: "zap", title: "Rápido", description: "Venda sem burocracia." },
  ],
  faq: [{ question: "Como compro?", answer: "Chame no WhatsApp." }],
  ctaText: "Fale conosco",
};

describe("landing-text.service", () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it("lança AppError 404 quando o conteúdo ainda não foi cadastrado", async () => {
    await expect(getContent()).rejects.toMatchObject({ statusCode: 404 });
  });

  it("cria o conteúdo no primeiro PUT", async () => {
    const created = await updateContent(baseInput);

    expect(created.heroTitle).toBe("Catálogo digital");
    expect(created.heroSubtitle).toBe("Venda direto pelo WhatsApp");
    expect(created.benefits).toHaveLength(1);
    expect(created.faq).toHaveLength(1);
    expect(created.ctaText).toBe("Fale conosco");
  });

  it("mantém um único documento em chamadas seguidas (singleton)", async () => {
    await updateContent(baseInput);
    await updateContent({ ...baseInput, ctaText: "Fale agora" });

    const count = await mongoose.connection
      .collection("landingtexts")
      .countDocuments();
    expect(count).toBe(1);
  });

  it("atualiza o conteúdo persistido", async () => {
    await updateContent(baseInput);
    await updateContent({
      ...baseInput,
      heroTitle: "Novo catálogo",
      ctaText: "Comprar agora",
    });

    const content = await getContent();
    expect(content.heroTitle).toBe("Novo catálogo");
    expect(content.ctaText).toBe("Comprar agora");
  });

  it("persiste as listas de benefícios e FAQ aninhadas", async () => {
    await updateContent({
      ...baseInput,
      benefits: [
        { icon: "zap", title: "Rápido", description: "Venda sem burocracia." },
        {
          icon: "shield",
          title: "Seguro",
          description: "Pagamento protegido.",
        },
      ],
      faq: [
        { question: "Como compro?", answer: "Chame no WhatsApp." },
        { question: "Entrega?", answer: "Combinamos no chat." },
      ],
    });

    const content = await getContent();
    expect(content.benefits).toHaveLength(2);
    expect(content.benefits?.[0]).toMatchObject({
      icon: "zap",
      title: "Rápido",
    });
    expect(content.faq).toHaveLength(2);
  });
});
