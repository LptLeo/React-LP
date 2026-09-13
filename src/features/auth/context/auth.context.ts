/**
 * Contexto de autenticação do painel administrativo.
 */
import { createContext } from "react";
import type { LoginFormValues } from "../schemas/login.schema";

export interface AuthContextValue {
  /** Token JWT do admin autenticado (ou `null`). */
  token: string | null;
  /** Se existe um token armazenado. */
  isAuthenticated: boolean;
  /** Autentica o admin e guarda o token. */
  login: (input: LoginFormValues) => Promise<void>;
  /** Encerra a sessão removendo o token. */
  logout: () => void;
}

/**
 * Contexto compartilhado da autenticação (inicialmente `null`).
 */
export const AuthContext = createContext<AuthContextValue | null>(null);
