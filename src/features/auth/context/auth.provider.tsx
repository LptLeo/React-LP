/**
 * Provedor de autenticação do painel administrativo.
 *
 * Mantém o token JWT em estado (inicializado a partir do `localStorage`) e
 * expõe `login`, `logout` e `isAuthenticated` para toda a árvore protegida.
 */
import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { LoginFormValues } from "../schemas/login.schema";
import {
  clearStoredToken,
  getStoredToken,
  login as loginRequest,
} from "../services/auth.service";
import { AuthContext } from "./auth.context";

/**
 * Provedor de autenticação.
 *
 * @param props.children - Árvore de componentes que consomem o contexto.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  const login = useCallback(async (input: LoginFormValues) => {
    const nextToken = await loginRequest(input);
    setToken(nextToken);
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({ token, isAuthenticated: token !== null, login, logout }),
    [token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
