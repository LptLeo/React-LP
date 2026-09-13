/**
 * Testes unitários da autorização `requireOwner` (rotas exclusivas de owner).
 *
 * Usa `mongodb-memory-server` e tokens JWT reais assinados com o `JWT_SECRET`
 * do ambiente de teste.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { env } from "../../../shared/config/env";
import { AdminModel } from "../../auth/model/admin.model";
import { requireOwner } from "./require-owner";

/** Assina um JWT válido para um administrador. */
function buildToken(adminId: string): string {
  return jwt.sign(
    { sub: adminId, email: "admin@exemplo.com" },
    env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

describe("requireOwner", () => {
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

  it("autoriza um owner com conta ativa", async () => {
    const admin = await AdminModel.create({
      email: "dona@exemplo.com",
      passwordHash: "hash-para-teste",
      role: "owner",
      active: true,
    });

    const request = new Request("http://localhost/api/admins", {
      headers: { authorization: `Bearer ${buildToken(admin._id.toString())}` },
    });

    const context = await requireOwner(request);
    expect(context._id.toString()).toBe(admin._id.toString());
    expect(context.role).toBe("owner");
  });

  it("bloqueia editor com AppError 403", async () => {
    const admin = await AdminModel.create({
      email: "editor@exemplo.com",
      passwordHash: "hash-para-teste",
      role: "editor",
      active: true,
    });

    const request = new Request("http://localhost/api/admins", {
      headers: { authorization: `Bearer ${buildToken(admin._id.toString())}` },
    });

    await expect(requireOwner(request)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("bloqueia conta desativada com AppError 401", async () => {
    const admin = await AdminModel.create({
      email: "inativo@exemplo.com",
      passwordHash: "hash-para-teste",
      role: "owner",
      active: false,
    });

    const request = new Request("http://localhost/api/admins", {
      headers: { authorization: `Bearer ${buildToken(admin._id.toString())}` },
    });

    await expect(requireOwner(request)).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("bloqueia token ausente com AppError 401", async () => {
    const request = new Request("http://localhost/api/admins");

    await expect(requireOwner(request)).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});
