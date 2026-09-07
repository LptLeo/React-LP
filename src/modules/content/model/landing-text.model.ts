/**
 * Modelo Mongoose do conteúdo da landing page.
 *
 * Persistido como documento único (singleton) — o service da feature garante a
 * existência de um registro via seed. Espelha `LandingTextDTO` (Zod).
 */
import { Schema, model, type Model } from "mongoose";
import type { LandingTextDTO } from "../dto/landing-text.dto";

export interface LandingTextDocument extends LandingTextDTO {
  createdAt: Date;
  updatedAt: Date;
}

const landingTextSchema = new Schema<LandingTextDocument>(
  {
    heroTitle: {
      type: String,
      required: [true, "Título do hero é obrigatório"],
      trim: true,
    },
    heroSubtitle: {
      type: String,
      required: [true, "Subtítulo é obrigatório"],
      trim: true,
    },
    benefits: [
      {
        _id: false,
        icon: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    faq: [
      {
        _id: false,
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    ctaText: {
      type: String,
      required: [true, "Texto do CTA é obrigatório"],
      trim: true,
    },
  },
  { timestamps: true, versionKey: false },
);

export const LandingTextModel: Model<LandingTextDocument> =
  model<LandingTextDocument>("LandingText", landingTextSchema);
