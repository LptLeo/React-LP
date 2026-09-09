/**
 * Testes unitários do serviço de Autenticação.
 *
 * Usa `mongodb-memory-server` para não depender do MongoDB local.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "../../../shared/config/env";
import { AppError } from "../../../shared/errors/AppError";
import { ensureAdmin, login } from "./auth.service";

describe("auth.service", () => {
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

  it("cria o admin a partir do env (seed)", async () => {
    const admin = await ensureAdmin();

    expect(admin.email).toBe(env.ADMIN_EMAIL);
    expect(admin.email).not.toBe(admin.passwordHash);
  });

  it("persiste a senha com hash bcrypt", async () => {
    const admin = await ensureAdmin();

    const matches = await bcrypt.compare(
      env.ADMIN_PASSWORD,
      admin.passwordHash,
    );
    expect(matches).toBe(true);
  });

  it("é idempotente (não duplica o admin)", async () => {
    await ensureAdmin();
    await ensureAdmin();

    const count = await mongoose.connection
      .collection("admins")
      .countDocuments();
    expect(count).toBe(1);
  });

  it("retorna token com credenciais válidas", async () => {
    await ensureAdmin();

    const { token } = await login({
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
    });

    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
  });

  it("rejeita senha incorreta com AppError 401", async () => {
    await ensureAdmin();

    await expect(
      login({ email: env.ADMIN_EMAIL, password: "senha-incorreta" }),
    ).rejects.toThrow(AppError);
  });
});
