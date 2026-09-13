/**
 * Modelo Mongoose do administrador da área administrativa.
 *
 * O `passwordHash` é gerado com bcrypt (nunca armazenar senha em texto puro).
 * A validação de entrada é feita na borda com Zod (fail fast).
 */
import { Schema, model, type Model } from "mongoose";

/** Papel de um administrador no painel. */
export type AdminRole = "owner" | "editor";

/**
 * Documento de administrador persistido no MongoDB.
 */
export interface AdminDocument {
  /** E-mail único do administrador. */
  email: string;
  /** Hash bcrypt da senha do administrador. */
  passwordHash: string;
  /** Nome de exibição do administrador (opcional). */
  name?: string;
  /** Papel do administrador: `owner` gerencia admins; `editor` usa o painel. */
  role: AdminRole;
  /** Se o administrador pode acessar o painel. */
  active: boolean;
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
    name: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["owner", "editor"],
      default: "editor",
      required: [true, "Papel é obrigatório"],
    },
    active: {
      type: Boolean,
      default: true,
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
