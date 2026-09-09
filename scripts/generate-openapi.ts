/**
 * Gera o documento OpenAPI 3.1 da API a partir dos schemas Zod.
 *
 * Usa `zod-openapi` para converter os DTOs em JSON Schema (autodocumentação)
 * e monta o documento completo com rotas, schemas e security no arquivo
 * `docs/openapi.json`.
 *
 * Uso: `npm run docs:api`
 *
 * @returns Promise<void>.
 */
import { writeFileSync } from "node:fs";
import { createSchema } from "zod-openapi";
import { loginSchema } from "../src/modules/auth/dto/login.dto";
import {
  productSchema,
  updateProductSchema,
} from "../src/modules/products/dto/product.dto";
import { landingTextSchema } from "../src/modules/content/dto/landing-text.dto";
import { contactInfoSchema } from "../src/modules/contact/dto/contact-info.dto";

const jsonContent = (schemaRef: string) => ({
  "application/json": { schema: { $ref: `#/components/schemas/${schemaRef}` } },
});

const errorResponse = () => ({
  description: "Erro de negócio ou validação",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          status: { type: "string", examples: ["error", "validation_error"] },
          message: { type: "string" },
          errors: { type: "object", additionalProperties: true },
        },
      },
    },
  },
});

const productListParameters = [
  {
    name: "page",
    in: "query",
    required: false,
    schema: { type: "integer", minimum: 1, default: 1 },
    description: "Número da página, iniciando em 1.",
  },
  {
    name: "limit",
    in: "query",
    required: false,
    schema: { type: "integer", minimum: 1, maximum: 50, default: 10 },
    description: "Quantidade de itens por página (máx. 50).",
  },
  {
    name: "search",
    in: "query",
    required: false,
    schema: { type: "string" },
    description: "Busca case-insensitive por título ou categoria.",
  },
  {
    name: "category",
    in: "query",
    required: false,
    schema: { type: "string" },
    description: "Filtro por categoria exata.",
  },
  {
    name: "featured",
    in: "query",
    required: false,
    schema: { type: "boolean" },
    description: "Filtra apenas produtos em destaque.",
  },
  {
    name: "active",
    in: "query",
    required: false,
    schema: { type: "boolean", default: true },
    description: "Filtra por visibilidade pública (padrão: true).",
  },
];

const idPathParameter = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "string" },
  description: "ID (ObjectId) do produto.",
};

const document = {
  openapi: "3.1.0",
  info: {
    title: "Catálogo Digital & E-commerce API",
    description:
      "API serverless (Netlify Functions) do catálogo digital com área administrativa.",
    version: "0.1.0",
  },
  servers: [{ url: "/", description: "Ambiente local (netlify dev)" }],
  tags: [
    { name: "Auth", description: "Autenticação da área administrativa" },
    { name: "Products", description: "Catálogo de produtos (CRUD)" },
    { name: "Content", description: "Textos institucionais e FAQ" },
    { name: "Contact", description: "Dados de contato e WhatsApp" },
  ],
  paths: {
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Autentica o administrador e emite token JWT",
        requestBody: { required: true, content: jsonContent("LoginRequest") },
        responses: {
          200: {
            description: "Login realizado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { token: { type: "string" } },
                },
              },
            },
          },
          401: errorResponse(),
        },
      },
    },
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "Lista produtos públicos com paginação e busca",
        parameters: productListParameters,
        responses: {
          200: {
            description: "Lista paginada de produtos",
            content: jsonContent("ProductPage"),
          },
          400: errorResponse(),
          405: errorResponse(),
        },
      },
      post: {
        tags: ["Products"],
        summary: "Cria um produto (admin)",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: jsonContent("Product") },
        responses: {
          201: {
            description: "Produto criado",
            content: jsonContent("Product"),
          },
          400: errorResponse(),
          401: errorResponse(),
          405: errorResponse(),
        },
      },
    },
    "/api/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Busca um produto pelo ID (público)",
        parameters: [idPathParameter],
        responses: {
          200: {
            description: "Produto encontrado",
            content: jsonContent("Product"),
          },
          400: errorResponse(),
          404: errorResponse(),
        },
      },
      put: {
        tags: ["Products"],
        summary: "Atualiza um produto (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [idPathParameter],
        requestBody: { required: true, content: jsonContent("ProductUpdate") },
        responses: {
          200: {
            description: "Produto atualizado",
            content: jsonContent("Product"),
          },
          400: errorResponse(),
          401: errorResponse(),
          404: errorResponse(),
          405: errorResponse(),
        },
      },
      delete: {
        tags: ["Products"],
        summary: "Remove um produto (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [idPathParameter],
        responses: {
          200: {
            description: "Produto removido",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", examples: ["ok"] },
                    message: {
                      type: "string",
                      examples: ["Produto removido."],
                    },
                  },
                },
              },
            },
          },
          400: errorResponse(),
          401: errorResponse(),
          404: errorResponse(),
          405: errorResponse(),
        },
      },
    },
    "/api/content": {
      get: {
        tags: ["Content"],
        summary: "Recupera os textos institucionais da landing",
        responses: { 200: { description: "Conteúdo da landing" } },
      },
      put: {
        tags: ["Content"],
        summary: "Atualiza os textos institucionais (admin)",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: jsonContent("LandingText") },
        responses: {
          200: { description: "Conteúdo atualizado" },
          401: errorResponse(),
        },
      },
    },
    "/api/contact": {
      get: {
        tags: ["Contact"],
        summary: "Recupera dados de contato e WhatsApp",
        responses: { 200: { description: "Dados de contato" } },
      },
      put: {
        tags: ["Contact"],
        summary: "Atualiza dados de contato (admin)",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: jsonContent("ContactInfo") },
        responses: {
          200: { description: "Contato atualizado" },
          401: errorResponse(),
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      LoginRequest: createSchema(loginSchema).schema,
      Product: createSchema(productSchema).schema,
      ProductUpdate: createSchema(updateProductSchema).schema,
      ProductPage: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/Product" },
          },
          total: { type: "integer" },
          page: { type: "integer" },
          limit: { type: "integer" },
          totalPages: { type: "integer" },
        },
      },
      LandingText: createSchema(landingTextSchema).schema,
      ContactInfo: createSchema(contactInfoSchema).schema,
    },
  },
};

writeFileSync(
  "docs/openapi.json",
  `${JSON.stringify(document, null, 2)}\n`,
  "utf-8",
);
console.info("[docs] openapi.json gerado com sucesso");
