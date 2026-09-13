/**
 * Rota protegida do painel administrativo.
 *
 * Redireciona para `/admin/login` quando não há token e preserva o destino
 * original (`location.state.from`) para retorno após o login.
 */
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

/**
 * Wrapper de rotas protegidas: autoriza o `<Outlet />` ou redireciona.
 */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <Outlet />;
}
