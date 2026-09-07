# Diretrizes de Arquitetura e Código Full Stack

Você é um assistente de IA especialista em desenvolvimento Full Stack TypeScript. Siga estritamente as regras de arquitetura, organização e padrões de código descritas neste documento em todas as tarefas.

---

## 1. Arquitetura Macro

### Backend (CSR Modular)

A arquitetura do backend deve seguir o padrão **Controller-Service-Repository (CSR) isolado por módulos (features)**:

- **Controller:** Borda HTTP. Faz parse e validação da requisição com Zod, chama o Service e devolve a resposta HTTP.
- **Service:** Regra de negócio pura. Lança `AppError` quando regras são violadas. Não acessa objetos de requisição/resposta (`req`, `res`).
- **Repository:** Comunicação com o banco de dados (ORM/Query Builder).
- **DTOs:** Schemas Zod convertidos para tipos TypeScript via `z.infer`.

Estrutura de pastas do backend:

```text
src/
├── modules/
│   └── [feature]/
│       ├── controllers/   # Ex: user.controller.ts
│       ├── services/      # Ex: create-user.service.ts
│       ├── repositories/  # Ex: user.repository.ts
│       ├── dtos/          # Ex: create-user.dto.ts
│       └── [feature].routes.ts
└── shared/                # Middlewares globais, AppError e conexões

```

### Frontend (Feature-Driven / App Router)

O frontend organiza-se por **domínios/funcionalidades** para manter componentes visuais e lógicas de estado agrupados:

Estrutura de pastas do frontend:

```text
src/
├── app/                   # Rotas e Serverless Handlers
│   ├── (public)/          # Landing Page e rotas abertas
│   ├── admin/             # Área administrativa protegida (/admin/*)
│   └── api/               # Serverless Endpoints / Actions
├── features/              # Módulos independentes por funcionalidade
│   ├── [feature]/
│   │   ├── components/    # Componentes de interface do domínio
│   │   ├── services/      # Chamadas de API e utilitários da feature
│   │   ├── hooks/         # Custom hooks do domínio
│   │   └── schemas/       # Validações Zod para formulários
├── shared/                # Componentes neutros de UI (Button, Input, Modal)
└── middleware.ts          # Proteção serverless de rotas (/admin/*)

```

---

## 2. Padrões de Codificação (Micro)

### Tipagem e Validação (TypeScript + Zod)

- **Zero `any`:** Proibido o uso de `any`. Use `unknown` quando o tipo for indeterminado antes da validação.
- **Validação na Borda:** Toda entrada de dados (body, params, query no backend; formulários no frontend) deve ser validada via Zod antes do processamento.

```typescript
// DTOs / Schemas (src/modules/[feature]/dtos ou src/features/[feature]/schemas)
import { z } from "zod";

export const productSchema = z.object({
  title: z.string().min(2, "Título é obrigatório"),
  price: z.number().positive("Preço deve ser maior que zero"),
  description: z.string().optional(),
});

export type ProductDTO = z.infer<typeof productSchema>;
```

### Tratamento de Exceções & Fail Fast

- Utilize a estratégia **Fail Fast** com cláusulas guarda no início das funções para evitar acoplamento e aninhamentos de `if/else`.
- Lance instâncias de `AppError` para falhas de negócio e capture todas no middleware global de erro.

```typescript
// Shared Error Class (src/shared/errors/AppError.ts)
export class AppError {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 400,
  ) {}
}

// Service Exemplo
export class CreateProductService {
  constructor(private productRepository: IProductRepository) {}

  async execute(data: ProductDTO): Promise<ProductResponse> {
    const productExists = await this.productRepository.findByTitle(data.title);

    // Cláusula Guarda (Fail Fast)
    if (productExists) {
      throw new AppError("Produto já cadastrado com este título.", 400);
    }

    return await this.productRepository.create(data);
  }
}
```

```typescript
// Backend Error Middleware (src/shared/middlewares/errorHandler.ts)
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (error instanceof AppError) {
    return res
      .status(error.statusCode)
      .json({ status: "error", message: error.message });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      status: "validation_error",
      errors: error.flatten().fieldErrors,
    });
  }

  console.error(error);
  return res
    .status(500)
    .json({ status: "error", message: "Erro interno do servidor" });
}
```

### Utilitários Frontend (Serviço de WhatsApp)

- Lógicas de integração externa (como geração de links de atendimento) devem ficar em arquivos de serviço dedicados na pasta da feature.

```typescript
// src/features/landing/services/whatsapp.service.ts
export function buildWhatsAppUrl(phone: string, productTitle?: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const message = productTitle
    ? `Olá! Gostaria de mais informações sobre o produto: ${productTitle}`
    : "Olá! Vim pelo site e gostaria de tirar algumas dúvidas.";

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
```

---

## 3. Princípios de Software e Fluxo de Trabalho

### Análise Prévia Obrigatória (DRY)

- Antes de criar novos componentes, utilitários, hooks ou DTOs, a IA **deve obrigatoriamente** inspecionar a pasta `shared/` e os módulos existentes.
- Reutilize o que já existir (componentes de UI, tokens, types, schemas, helpers) em vez de duplicar código. Só crie algo novo quando não houver alternativa reutilizável.

### Princípios de Código (KISS & SOLID)

- **KISS (Keep It Simple, Stupid):** Mantenha soluções simples. Não crie abstrações ou padrões de design complexos sem necessidade real. Prefira o código mais direto que atenda ao requisito.
- **SRP (Single Responsibility Principle):** Separe estritamente responsabilidades entre UI, regras de negócio e persistência. Cada módulo, classe ou função deve ter um único motivo para mudar.
- **Fail Fast:** Use retornos precoces (_early returns_) e cláusulas guarda no início das funções para evitar aninhamentos profundos e lidar com erros imediatamente.

---

## 4. Boas Práticas de Web Design (Frontend/UI)

### Hierarquia Visual & Layout

- **Foco em uma ação principal por seção:** Cada bloco da página (hero, benefícios, produtos, CTA) deve ter um único objetivo e um CTA dominante. Evite competição entre botões.
- **Hierarquia clara:** Um título por seção (`h1`/`h2`), um subtítulo, e um corpo de texto. Diferencie níveis por tamanho, peso e espaçamento — nunca apenas por cor.
- **Espaçamento consistente:** Use um sistema de escala (ex: `4px`/`8px`/`16px`/`24px`/`48px`/`96px`) e mantenha `padding`/`margin` coerentes entre seções. Evite valores arbitrários.
- **Alinhamento:** Mantenha alinhamentos à esquerda para texto corrido. Centralize apenas blocos curtos (call to action, logos, títulos de hero).
- **Fluidez responsiva:** Todas as seções devem quebrar corretamente em mobile/tablet/desktop. Teste sempre a partir de `320px`. Use `clamp()` e unidades relativas.

### Tipografia

- **Limite de fontes:** No máximo 2 famílias tipográficas (ex: uma para display/títulos e uma para corpo). Nunca misture mais de 2 sem justificativa.
- **Contraste de leitura:** Garanta contraste WCAG AA (4.5:1 para texto normal, 3:1 para texto grande) entre texto e fundo.
- **Tamanho legível:** Corpo de texto nunca abaixo de `16px`. Títulos com escala clara (ex: `clamp(2rem, 5vw, 3.5rem)` para hero).
- **Line-height/line length:** `line-height` entre `1.5` e `1.7` para parágrafos; limite de ~65-75 caracteres por linha para leitura confortável.
- **Estilo mínimos:** Ligue o `font-feature-settings`/`font optical sizing` quando disponível e evite usar mais de 2 pesos no mesmo elemento.

### Cores & Branding

- **Paleta limitada:** Defina uma paleta de tokens (primária, secundária, neutros, sucesso/erro/aviso) e use variáveis de tema — nunca códigos hex soltos no estilo.
- **1 cor de destaque:** Use uma única cor de ação (ex: botão primário e links). Limite cores vivas a ~10-15% da tela para não poluir.
- **Modo escuro/claro:** Quando houver toggle, garanta contraste e consistência em ambos os temas usando tokens semânticos.
- **Coerência de estado:** Defina estados claros para hover, active, focus, disabled e erro — com transições suaves (`150-250ms`).

### Componentes & Interação

- **Feedback visual:** Todo elemento interativo (botão, link, input) deve ter estado de `hover`, `focus` (com outline visível) e `active`. Formulários com estados de erro/validação claros.
- **Acessibilidade (a11y):** Use elementos semânticos (`button`, `nav`, `main`, `section`), atributos `aria-*` quando necessário, `alt` em imagens e contraste adequado. Navegável por teclado (`Tab`).
- **Micro-interações sutis:** Animações curtas e com propósito (nunca puramente decorativas ou excessivas). Respeite `prefers-reduced-motion`.
- **Carregamento:** Use skeletons em vez de spinners para conteúdo, e placeholders (`priority`/`loading="lazy"` em imagens) para otimizar LCP.

### Design Tokens & Estilo

```css
/* Exemplo de tokens semânticos (src/shared/styles/tokens.css) */
:root {
  --color-primary: #1a73e8;
  --color-secondary: #5f6368;
  --color-surface: #ffffff;
  --color-background: #f8f9fa;
  --color-text: #202124;
  --color-danger: #d93025;
  --color-success: #188038;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 48px;
  --space-6: 96px;

  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;

  --font-display: "Inter", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.14);
}
```

- **Nunca** use hex solto ou espaçamento `magic number` no componente — sempre referencie os tokens.
- **Mobile-first:** escreva o estilo base para mobile e faça `media query` (`min-width`) para expandir para tablet/desktop.

### Práticas obrigatórias no desenvolvimento

- **Zero `any` e zero CSS inline** — todo estilo via classes/Tailwind/token.
- **Goldente path de UX:** cada página deve responder à pergunta "qual é a próxima ação do usuário?" e guiá-lo claramente (ex: hero → benefícios → produtos → CTA WhatsApp).
- **Imagens otimizadas:** defina `width`/`height` para evitar layout shift (CLS) e use formatos modernos (WebP/AVIF).

---

## 5. Convenções de Nomenclatura

- **Arquivos:** `kebab-case` com o tipo de papel (`user.controller.ts`, `product-card.tsx`, `auth.service.ts`).
- **Classes, Interfaces e Types:** `PascalCase` (`CreateUserService`, `ProductCardProps`, `ProductDTO`).
- **Variáveis, Métodos e Funções:** `camelCase` (`buildWhatsAppUrl`, `handleDelete`, `execute`).

---

## 6. Padrões e Manutenção da Documentação

### Sincronização Automática de Documentação

- Sempre que a IA **criar, modificar ou refatorar** um arquivo, rota, serviço ou variável de ambiente, ela **DEVE** atualizar simultaneamente os arquivos de documentação impactados (JSDoc, Zod schemas, `.env.example` ou `README.md`/`docs`).
- **Nunca considere uma tarefa concluída se o código mudou mas a documentação ficou desatualizada.**

### Atualização sob Demanda (Escaneamento Eficiente)

- Quando o usuário solicitar a atualização da documentação do projeto, faça uma varredura **direcionada** focando apenas nos arquivos novos ou modificados recentemente — verificando o escopo do módulo afetado ou o histórico de alterações (`git log`/`git diff`).
- Evite reprocessar arquivos intactos e inalterados desnecessariamente.

### Boas Práticas de Documentação no Código (Documentação Viva)

- **JSDoc Obrigatório:** Todas as funções exportadas em serviços (`services/`), utilitários (`shared/`) e custom hooks (features `hooks/`) devem conter bloco JSDoc com:
  - Descrição do propósito;
  - Parâmetros (`@param`);
  - Retorno (`@returns`);
  - Exceções possíveis (`@throws AppError`).

```typescript
/**
 * Busca um produto pelo título no repositório.
 *
 * @param title - Título exato do produto a ser localizado.
 * @returns Produto encontrado ou `null` caso não exista.
 * @throws AppError - Caso o produto já esteja cadastrado (status 400).
 */
export async function findByTitle(title: string): Promise<Product | null> {
  // ...
}
```

- **Zod com Contexto:** Todos os campos em schemas Zod de DTOs/formulários devem ter **mensagens de erro explícitas** (fail fast na borda) e a cláusula `.describe()` em campos complexos para servirem como autodocumentação de API.

```typescript
const createProductSchema = z.object({
  title: z.string().min(2, "Título é obrigatório"),
  price: z
    .number()
    .positive("Preço deve ser maior que zero")
    .describe("Preço do produto em reais com até 2 casas decimais"),
});
```

- **Nível Macro (README / `docs/`):** Quando novas rotas, variáveis de ambiente (`env`) ou módulos forem adicionados, atualize o `README.md` ou os arquivos na pasta `/docs` correspondentes (ex: listar novas rotas na documentação de API e novas variáveis no `.env.example`).

---

## 7. Padronização de Commits (Conventional Commits)

Todas as mensagens de commit geradas pela IA devem seguir estritamente o padrão **Conventional Commits**:

- `feat:` Nova funcionalidade para o usuário (`feat(catalog): adiciona filtro por categoria`).
- `fix:` Correção de bug ou erro de código (`fix(auth): corrige expiração do token`).
- `docs:` Alterações puras em documentação (`docs: atualiza instruções do README`).
- `style:` Ajustes de formatação ou estilo CSS sem mudar lógica (`style(ui): ajusta padding dos botões`).
- `refactor:` Mudança no código que não altera comportamento nem corrige bug (`refactor(service): simplifica busca no mongo`).
- `chore:` Atualização de dependências, configs de build ou ferramentas (`chore: adiciona dependência do zod`).

## 8. Fluxo de Git e Branches

- **Nunca commite diretamente na `main`:** Crie sempre uma nova branch a partir da `main` atualizada antes de iniciar qualquer tarefa.
- **Nomenclatura de Branches:** Use o formato `tipo/numero-issue-nome-curto` (ex: `feat/10-componentes-ui`, `fix/16-protecao-rotas`).
- **Finalização:** Após concluir a tarefa, envie a branch para o repositório remoto (`git push -u origin <branch>`) e crie o Pull Request via GitHub CLI (`gh pr create`).
