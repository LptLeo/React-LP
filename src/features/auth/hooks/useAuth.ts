/**
 * Hook de acesso ao contexto de autenticação.
 */
import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "../context/auth.context";

/**
 * Consome o contexto de autenticação.
 *
 * @returns Contexto de autenticação com `token`, `login`, `logout` e flags.
 * @throws Error - Se usado fora de um `AuthProvider`.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider.");
  }

  return context;
}
