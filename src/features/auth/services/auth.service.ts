/**
 * Serviço de autenticação do painel administrativo.
 *
 * Encapsula a chamada à API (`/api/auth/login`), o token JWT e sua persistência
 * no `localStorage` (chave `react-lp.admin.token`).
 */
import type { LoginFormValues } from "../schemas/login.schema";

export const TOKEN_STORAGE_KEY = "react-lp.admin.token";

interface LoginResponse {
  status: string;
  data?: { token?: string };
  message?: string;
}

/**
 * Lê o token JWT armazenado no `localStorage`.
 *
 * @returns Token armazenado ou `null` quando ausente.
 */
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Descarta o token JWT do `localStorage` (logout).
 */
export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Autentica o administrador e persiste o token JWT de acesso.
 *
 * @param input - Credenciais `{ email, password }` já validadas (Zod).
 * @returns Token JWT retornado pela API.
 * @throws Error - Se a API falhar ou não devolver token (mensagem amigável).
 */
export async function login(input: LoginFormValues): Promise<string> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as LoginResponse;

  if (!response.ok || !payload.data?.token) {
    throw new Error(
      payload.message ?? "Não foi possível entrar. Tente novamente.",
    );
  }

  localStorage.setItem(TOKEN_STORAGE_KEY, payload.data.token);
  return payload.data.token;
}
