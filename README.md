# Catálogo Digital & E-commerce integrado ao WhatsApp

Catálogo digital responsivo com fluxo de pedido direto para o WhatsApp, painel administrativo para gestão de produtos, estoque, fotos e conteúdos — sem custos fixos de infraestrutura e sem depender de suporte técnico.

---

## 1. Visão Geral do Projeto

### Proposta de Valor

| Público      | Benefício                                                                                                                                                |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cliente**  | Navegação rápida em catálogo responsivo, busca em tempo real, seleção de itens e envio de pedido formatado direto para o WhatsApp do vendedor.           |
| **Vendedor** | Painel administrativo (`/admin`) para gestão de produtos, estoque, fotos e conteúdos, sem depender de suporte técnico ou custos fixos de infraestrutura. |

---

## 2. Requisitos Funcionais

### Área Pública (Landing Page)

- **Hero Banner** com CTA de navegação.
- **Produtos em Destaque** exibidos em carrossel.
- **Catálogo em Grade** com busca/filtro em tempo real.
- **Fluxo de pedido dinâmico** via WhatsApp (seleção de itens + mensagem formatada).
- **Seção de FAQ** interativa e links de contato/redes sociais.
- **Botão "Recomendar Produto"**.

### Área Administrativa (`/admin`)

- **Tela de login** com autenticação.
- **CRUD de Produtos**: título, descrição, preço, quantidade, status ativo/destaque e upload de imagem via Cloudinary.
- **Gestão de Conteúdo**: edição de textos institucionais e perguntas do FAQ.
- **Configuração de Dados de Contato**: telefone, e-mail, template da mensagem do WhatsApp e redes sociais.

---

## 3. Modelo Conceitual de Dados

### Product

| Campo         | Tipo      | Descrição                                            |
| ------------- | --------- | ---------------------------------------------------- |
| `id`          | `string`  | Identificador único do produto.                      |
| `title`       | `string`  | Título do produto.                                   |
| `description` | `string`  | Descrição detalhada do produto.                      |
| `price`       | `number`  | Preço do produto em reais.                           |
| `imageUrl`    | `string`  | URL da imagem hospedada no Cloudinary.               |
| `quantity`    | `number`  | Quantidade disponível em estoque.                    |
| `isFeatured`  | `boolean` | Define se o produto aparece em destaque (carrossel). |
| `isActive`    | `boolean` | Define se o produto está ativo/visível no catálogo.  |
| `createdAt`   | `Date`    | Data de criação do registro.                         |

### LandingText

| Campo        | Tipo     | Descrição                                                            |
| ------------ | -------- | -------------------------------------------------------------------- |
| `id`         | `string` | Identificador único do conteúdo.                                     |
| `sectionKey` | `string` | Chave que identifica a seção da página (ex: `hero`, `faq`, `about`). |
| `title`      | `string` | Título do conteúdo exibido na seção.                                 |
| `content`    | `string` | Corpo do conteúdo (texto institucional ou pergunta/resposta do FAQ). |

### ContactInfo

| Campo                     | Tipo     | Descrição                                            |
| ------------------------- | -------- | ---------------------------------------------------- |
| `id`                      | `string` | Identificador único do registro.                     |
| `phone`                   | `string` | Telefone/WhatsApp do vendedor (com DDI e DDD).       |
| `email`                   | `string` | E-mail de contato.                                   |
| `instagram`               | `string` | Handle do Instagram.                                 |
| `facebook`                | `string` | URL ou handle do Facebook.                           |
| `whatsappMessageTemplate` | `string` | Template da mensagem de pedido enviada via WhatsApp. |

---

## 4. Tech Stack & Arquitetura

| Camada                     | Tecnologia                                                |
| -------------------------- | --------------------------------------------------------- |
| **Frontend**               | React.js (Vite) + TypeScript + Tailwind CSS               |
| **Validação & Tipagem**    | Zod + JSDoc (autodocumentação)                            |
| **Backend / API**          | Serverless Functions (**Netlify**) — handler Web standard |
| **Banco de Dados**         | MongoDB Atlas (M0 Free Tier) — Mongoose                   |
| **Armazenamento de Mídia** | Cloudinary API                                            |

### Estrutura de Pastas (Frontend)

```text
netlify/
└── functions/           # Serverless Functions (ex: health.ts)
src/
├── app/                 # Rotas e páginas da aplicação
│   ├── (public)/        # Landing Page e rotas abertas
│   ├── admin/           # Área administrativa protegida (/admin/*)
│   └── api/             # Handlers/Serverless Endpoints
├── features/            # Módulos independentes por funcionalidade
│   ├── [feature]/
│   │   ├── components/  # Componentes de interface do domínio
│   │   ├── services/    # Chamadas de API e utilitários da feature
│   │   ├── hooks/       # Custom hooks do domínio
│   │   └── schemas/     # Validações Zod para formulários
├── shared/              # Código reutilizável (UI, config, database, cloudinary, errors)
│   ├── components/      # Componentes neutros de UI (Button, Input, Modal)
│   ├── config/          # env.ts (validação Zod das variáveis de ambiente)
│   ├── database/        # mongo.ts (conexão Mongoose)
│   ├── cloudinary/      # upload/delete de mídias
│   ├── errors/          # AppError e errorHandler
│   └── styles/          # tokens.css (design tokens)
└── middleware.ts         # Proteção serverless de rotas (/admin/*)
```

---

## 5. Guia de Instalação e Execução Local

### Pré-requisitos

- **Node.js 18+** (recomendado: última versão LTS).
- Contas gratuitas para os serviços externos:
  - [MongoDB Atlas](https://www.mongodb.com/atlas) (M0 Free Tier) — string de conexão.
  - [Cloudinary](https://cloudinary.com/) — Cloud Name, API Key e API Secret.

### Instalação de Dependências

```bash
npm install
```

### Variáveis de Ambiente

Copie o arquivo modelo e preencha com suas credenciais:

```bash
cp .env.example .env
```

> **Importante:** nunca commite o arquivo `.env`. Ele já está ignorado pelo `.gitignore`.

### Execução em Desenvolvimento

```bash
npm run dev
```

O servidor de desenvolvimento será iniciado e o endereço local será exibido no terminal (padrão `http://localhost:5173`).

### Build de Produção

```bash
npm run build
npm run preview
```

### Banco de Dados Local (Docker)

Para desenvolvimento sem depender do MongoDB Atlas, suba um MongoDB via Docker Compose:

```bash
docker compose up -d
```

O container `catalogo-mongo` fica disponível em `mongodb://localhost:27017`. Defina no `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/catalogo
```

O Mongoose cria o banco `catalogo` automaticamente na primeira conexão. Para derrubar: `docker compose down` (mantém os dados por causa do volume `mongo-data`).

### Execução Local com Serverless Functions (Netlify)

As Serverless Functions ficam em `netlify/functions/` e usam Node **20** (definido em `.nvmrc` e `netlify.toml`). Para testá-las localmente, instale a CLI e rode:

```bash
npm install -g netlify-cli
netlify dev
```

A function de health check fica disponível em `http://localhost:8888/.netlify/functions/health` e valida a conexão com o MongoDB.

A especificação **OpenAPI** da API é gerada automaticamente a partir dos DTOs Zod (`npm run docs:api`) em `docs/openapi.json`.

### Endpoints atuais

| Rota                         | Métodos | Descrição                                                               |
| ---------------------------- | ------- | ----------------------------------------------------------------------- |
| `/.netlify/functions/health` | GET     | Status do serviço e da conexão com o banco.                             |
| `/.netlify/functions/auth`   | POST    | Login do admin (`{ email, password }`) → `{ status, data: { token } }`. |

O admin inicial é criado/seeded automaticamente na primeira chamada a `auth` (upsert idempotente usando `ADMIN_EMAIL`/`ADMIN_PASSWORD` do `.env` com hash bcrypt).

### Convenção de Commits e Workflow Git

Este projeto utiliza **Conventional Commits** validados automaticamente via Husky e Commitlint.

- **Mensagens de Commit:** Devem seguir o formato `tipo(escopo): descrição` (ex: `feat(admin): cria tela de login`).
- **Branches:** As alterações devem ser feitas em branches isoladas com a nomenclatura `tipo/numero-issue-descricao` (ex: `feat/1-setup-inicial`).

---

## Scripts Disponíveis

| Comando                | Descrição                                         |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | Inicia o servidor de desenvolvimento (Vite).      |
| `npm run build`        | Compila o TypeScript e gera o bundle de produção. |
| `npm run lint`         | Executa o ESLint no projeto.                      |
| `npm run lint:fix`     | Executa o ESLint corrigindo problemas.            |
| `npm run format`       | Formata o código com Prettier.                    |
| `npm run format:check` | Verifica a formatação sem alterar arquivos.       |
| `npm run test`         | Executa os testes unitários (Vitest).             |
| `npm run test:watch`   | Executa os testes em modo watch.                  |
| `npm run docs:api`     | Gera `docs/openapi.json` a partir dos DTOs Zod.   |
| `npm run preview`      | Serve localmente o bundle de produção gerado.     |
