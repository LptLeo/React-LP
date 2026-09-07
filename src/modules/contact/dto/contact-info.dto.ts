/**
 * DTOs e schemas do Módulo de Contato.
 *
 * `contactInfoSchema` centraliza os dados de contato, redes sociais e o template
 * de mensagem usado nos links de WhatsApp. Persistido como singleton.
 */
import { z } from "zod";

export const socialLinkSchema = z
  .object({
    /** Nome da rede/perfil (ex: Instagram, Telegram, YouTube). */
    label: z.string().min(1, "Label da rede social é obrigatório"),
    /** URL completa do perfil. */
    url: z.url("URL da rede social inválida"),
  })
  .describe("Link de rede social exibida no rodapé");

export const contactInfoSchema = z
  .object({
    /** Número de WhatsApp (DDI + DDD + número, apenas dígitos). */
    whatsappPhone: z
      .string()
      .regex(/^\d{9,15}$/, "WhatsApp deve conter entre 9 e 15 dígitos"),
    /** E-mail de contato público. */
    email: z.email("E-mail inválido"),
    /** Lista de redes sociais. */
    socials: z.array(socialLinkSchema).default([]),
    /** Template da mensagem padrão enviada pelo WhatsApp. */
    whatsappMessageTemplate: z
      .string()
      .min(2, "Template de mensagem é obrigatório"),
  })
  .describe("Dados de contato, redes sociais e template de WhatsApp");

export type ContactInfoDTO = z.infer<typeof contactInfoSchema>;
export type SocialLinkDTO = z.infer<typeof socialLinkSchema>;
