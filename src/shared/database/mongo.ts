/**
 * Conexão com o MongoDB via Mongoose.
 *
 * Mantém uma conexão única (singleton) reutilizada pelas Serverless Functions,
 * usando *caching* da conexão em escopo global para evitar múltiplas conexões
 * por invocação.
 *
 * @returns Mongoose conetado.
 * @throws AppError - Caso a conexão falhe (status 500).
 */
import mongoose from "mongoose";
import { AppError } from "../errors/AppError";
import { env } from "../config/env";

const globalWithMongo = globalThis as typeof globalThis & {
  mongooseConnection?: typeof mongoose;
};

export async function connectDatabase(): Promise<typeof mongoose> {
  if (globalWithMongo.mongooseConnection) {
    return globalWithMongo.mongooseConnection;
  }

  try {
    globalWithMongo.mongooseConnection = await mongoose.connect(
      env.MONGODB_URI,
      {
        serverSelectionTimeoutMS: 10000,
      },
    );
    console.info("[mongo] conexão estabelecida com MongoDB Atlas");
    return globalWithMongo.mongooseConnection;
  } catch (error) {
    console.error("[mongo] falha ao conectar:", error);
    throw new AppError("Não foi possível conectar ao banco de dados.", 500);
  }
}
