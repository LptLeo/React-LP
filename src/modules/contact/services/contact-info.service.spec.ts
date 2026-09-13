/**
 * Testes unitários do serviço de Contato.
 *
 * Usa `mongodb-memory-server` para não depender do MongoDB local.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import type { ContactInfoDTO } from "../dto/contact-info.dto";
import { getContact, updateContact } from "./contact-info.service";

const baseInput: ContactInfoDTO = {
  whatsappPhone: "5511999999999",
  email: "contato@exemplo.com",
  socials: [{ label: "Instagram", url: "https://instagram.com/loja" }],
  whatsappMessageTemplate: "Olá! Vim pelo site.",
};

describe("contact-info.service", () => {
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

  it("lança AppError 404 quando os contatos ainda não foram cadastrados", async () => {
    await expect(getContact()).rejects.toMatchObject({ statusCode: 404 });
  });

  it("cria os dados de contato no primeiro PUT", async () => {
    const created = await updateContact(baseInput);

    expect(created.whatsappPhone).toBe("5511999999999");
    expect(created.email).toBe("contato@exemplo.com");
    expect(created.socials).toHaveLength(1);
    expect(created.whatsappMessageTemplate).toBe("Olá! Vim pelo site.");
  });

  it("mantém um único documento em chamadas seguidas (singleton)", async () => {
    await updateContact(baseInput);
    await updateContact({ ...baseInput, email: "novo@exemplo.com" });

    const count = await mongoose.connection
      .collection("contactinfos")
      .countDocuments();
    expect(count).toBe(1);
  });

  it("atualiza os dados de contato persistidos", async () => {
    await updateContact(baseInput);
    await updateContact({
      ...baseInput,
      whatsappPhone: "5511888888888",
      whatsappMessageTemplate: "Olá! Quero um orçamento.",
    });

    const contact = await getContact();
    expect(contact.whatsappPhone).toBe("5511888888888");
    expect(contact.whatsappMessageTemplate).toBe("Olá! Quero um orçamento.");
  });

  it("persiste múltiplas redes sociais", async () => {
    await updateContact({
      ...baseInput,
      socials: [
        { label: "Instagram", url: "https://instagram.com/loja" },
        { label: "YouTube", url: "https://youtube.com/loja" },
      ],
    });

    const contact = await getContact();
    expect(contact.socials).toHaveLength(2);
    expect(contact.socials?.[1]).toMatchObject({ label: "YouTube" });
  });
});
