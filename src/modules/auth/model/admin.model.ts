/**
 * Modelo Mongoose do administrador da área administrativa.
 *
 * O `passwordHash` é gerado com bcrypt (nunca armazenar senha em texto puro).
 * A validação de entrada é feita na borda com Zod (fail fast).
 */
import { Schema, model, type Model } from "mongoose";

/**
 * Documento de administrador persistido no MongoDB.
 */
export interface AdminDocument {
  /** E-mail único do administrador. */
  email: string;
  /** Hash bcrypt da senha do administrador. */
  passwordHash: string;
  /** Data de criação do registro. */
  createdAt: Date;
  /** Data da última atualização do registro. */
  updatedAt: Date;
}

/**
 * Schema Mongoose da coleção de administradores.
 */
const adminSchema = new Schema<AdminDocument>(
  {
    email: {
      type: String,
      required: [true, "E-mail é obrigatório"],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Hash de senha é obrigatório"],
    },
  },
  { timestamps: true, versionKey: false },
);

/**
 * Modelo registrado da coleção `admins`.
 *
 * Utilizado pelos repositories do módulo de Auth.
 */
export const AdminModel: Model<AdminDocument> = model<AdminDocument>(
  "Admin",
  adminSchema,
);
