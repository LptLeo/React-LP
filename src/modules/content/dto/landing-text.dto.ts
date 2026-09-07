/**
 * DTOs e schemas do Módulo de Conteúdo (textos institucionais).
 *
 * `landingTextSchema` representa o bloco de conteúdo da home (hero, benefícios,
 * FAQ e CTA). Persistido como documento único (singleton).
 */
import { z } from "zod";

export const benefitSchema = z
  .object({
    /** Nome do ícone exibido no card do benefício. */
    icon: z.string().min(1, "Ícone é obrigatório"),
    /** Título curto do benefício. */
    title: z.string().min(2, "Título do benefício é obrigatório"),
    /** Descrição explicativa do benefício. */
    description: z.string().min(10, "Descrição do benefício muito curta"),
  })
  .describe("Card de benefício da seção de vantagens");

export const faqItemSchema = z
  .object({
    /** Pergunta exibida no acordeão do FAQ. */
    question: z.string().min(3, "Pergunta é obrigatória"),
    /** Resposta exibida ao expandir a pergunta. */
    answer: z.string().min(3, "Resposta é obrigatória"),
  })
  .describe("Item de pergunta e resposta do FAQ");

export const landingTextSchema = z
  .object({
    /** Título principal da seção hero. */
    heroTitle: z.string().min(2, "Título do hero é obrigatório"),
    /** Subtítulo de apoio exibido abaixo do título do hero. */
    heroSubtitle: z.string().min(5, "Subtítulo do hero é obrigatório"),
    /** Lista de benefícios exibida na home. */
    benefits: z.array(benefitSchema).default([]),
    /** Perguntas e respostas do FAQ. */
    faq: z.array(faqItemSchema).default([]),
    /** Texto do botão de chamada para ação (CTA). */
    ctaText: z.string().min(2, "Texto do CTA é obrigatório"),
  })
  .describe("Textos institucionais da landing page (singleton)");

export type LandingTextDTO = z.infer<typeof landingTextSchema>;
export type BenefitDTO = z.infer<typeof benefitSchema>;
export type FaqItemDTO = z.infer<typeof faqItemSchema>;
