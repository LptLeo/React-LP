/**
 * Testes unitários do serviço de Gestão de Administradores.
 *
 * Usa `mongodb-memory-server` para não depender do MongoDB local.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { AppError } from "../../../shared/errors/AppError";
import { AdminModel } from "../../auth/model/admin.model";
import type { CreateAdminDTO } from "../dto/admin.dto";
import {
  createAdminAccount,
  deleteAdminAccount,
  listAdminAccounts,
  updateAdminAccount,
} from "./admin.service";

const ownerInput: CreateAdminDTO = {
  name: "Dona Inicial",
  email: "dona@exemplo.com",
  password: "senha-segura-123",
  role: "owner",
  active: true,
};

const editorInput: CreateAdminDTO = {
  name: "Editor Um",
  email: "editor@exemplo.com",
  password: "senha-segura-123",
  role: "editor",
  active: true,
};

describe("admin.service", () => {
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

  it("cria um administrador com hash bcrypt sem expor o passwordHash", async () => {
    const admin = await createAdminAccount(editorInput);

    expect(admin).not.toHaveProperty("passwordHash");
    expect(admin.role).toBe("editor");
    expect(admin.active).toBe(true);
    expect(admin.email).toBe("editor@exemplo.com");

    const stored = await AdminModel.findById(admin._id);
    expect(stored).not.toBeNull();
    const matches = await bcrypt.compare(
      "senha-segura-123",
      stored!.passwordHash,
    );
    expect(matches).toBe(true);
  });

  it("rejeita e-mail duplicado com AppError 409", async () => {
    await createAdminAccount(editorInput);

    await expect(createAdminAccount(editorInput)).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("lista administradores sem expor o passwordHash", async () => {
    await createAdminAccount(ownerInput);
    await createAdminAccount(editorInput);

    const admins = await listAdminAccounts();

    expect(admins).toHaveLength(2);
    for (const admin of admins) {
      expect(admin).not.toHaveProperty("passwordHash");
    }
  });

  it("atualiza parcialmente nome e papel de um administrador", async () => {
    const created = await createAdminAccount(editorInput);

    const updated = await updateAdminAccount(created._id, {
      name: "Editor Sênior",
      role: "owner",
    });

    expect(updated.name).toBe("Editor Sênior");
    expect(updated.role).toBe("owner");
  });

  it("reseta a senha gerando um novo hash bcrypt", async () => {
    const created = await createAdminAccount(editorInput);

    await updateAdminAccount(created._id, { password: "nova-senha-456" });

    const stored = await AdminModel.findById(created._id);
    expect(stored).not.toBeNull();

    const newMatches = await bcrypt.compare(
      "nova-senha-456",
      stored!.passwordHash,
    );
    const oldMatches = await bcrypt.compare(
      "senha-segura-123",
      stored!.passwordHash,
    );
    expect(newMatches).toBe(true);
    expect(oldMatches).toBe(false);
  });

  it("rejeita ID inválido com AppError 400 (update e delete)", async () => {
    await expect(
      updateAdminAccount("id-invalido", { name: "X" }),
    ).rejects.toBeInstanceOf(AppError);
    await expect(
      deleteAdminAccount("id-invalido", "actor-id"),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("rejeita administrador inexistente com AppError 404", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    await expect(
      updateAdminAccount(fakeId, { name: "X" }),
    ).rejects.toMatchObject({ statusCode: 404 });
    await expect(deleteAdminAccount(fakeId, "actor-id")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("bloqueia desativar o último owner (evita lockout)", async () => {
    const owner = await createAdminAccount(ownerInput);

    await expect(
      updateAdminAccount(owner._id, { active: false }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("bloqueia rebaixar o último owner para editor", async () => {
    const owner = await createAdminAccount(ownerInput);

    await expect(
      updateAdminAccount(owner._id, { role: "editor" }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("bloqueia remover o próprio administrador", async () => {
    const owner = await createAdminAccount(ownerInput);

    await expect(
      deleteAdminAccount(owner._id, owner._id),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("bloqueia remover o último owner", async () => {
    const owner = await createAdminAccount(ownerInput);

    await expect(
      deleteAdminAccount(owner._id, "outro-id"),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("remove um administrador normalmente", async () => {
    const editor = await createAdminAccount(editorInput);

    await deleteAdminAccount(editor._id, "outro-id");

    const count = await AdminModel.countDocuments();
    expect(count).toBe(0);
  });
});
