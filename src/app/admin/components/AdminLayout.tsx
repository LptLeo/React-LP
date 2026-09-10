/**
 * Layout do painel administrativo.
 *
 * Cabeçalho com navegação (links ativos) e ação de sair; renderiza o conteúdo
 * da rota ativa via `<Outlet />`.
 */
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/lib/cn";

const navItems = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Produtos" },
  { to: "/admin/content", label: "Conteúdo" },
  { to: "/admin/contact", label: "Contato" },
];

/**
 * Estrutura do painel: header fixo + nav + área de conteúdo protegida.
 */
export function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="bg-background flex min-h-svh flex-col">
      <header className="bg-surface border-secondary/15 sticky top-0 z-10 border-b">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <Link
            to="/admin"
            className="font-display text-primary text-base font-semibold"
          >
            Catálogo Digital
          </Link>

          <nav
            aria-label="Navegação do painel"
            className="flex items-center gap-1"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-secondary hover:bg-secondary/10 hover:text-text",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}

            <Button variant="ghost" size="sm" onClick={logout} className="ml-2">
              Sair
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
