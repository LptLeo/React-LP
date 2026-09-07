/**
 * Modelo Mongoose de informações de contato.
 *
 * Persistido como documento único (singleton) — mirrors `ContactInfoDTO` (Zod).
 */
import { Schema, model, type Model } from "mongoose";
import type { ContactInfoDTO } from "../dto/contact-info.dto";

export interface ContactInfoDocument extends ContactInfoDTO {
  createdAt: Date;
  updatedAt: Date;
}

const contactInfoSchema = new Schema<ContactInfoDocument>(
  {
    whatsappPhone: {
      type: String,
      required: [true, "WhatsApp é obrigatório"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "E-mail é obrigatório"],
      trim: true,
      lowercase: true,
    },
    socials: [
      {
        _id: false,
        label: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    whatsappMessageTemplate: {
      type: String,
      required: [true, "Template de mensagem é obrigatório"],
      trim: true,
    },
  },
  { timestamps: true, versionKey: false },
);

export const ContactInfoModel: Model<ContactInfoDocument> =
  model<ContactInfoDocument>("ContactInfo", contactInfoSchema);
