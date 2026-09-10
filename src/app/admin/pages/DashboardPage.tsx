/**
 * Dashboard do painel administrativo.
 */
import { Link } from "react-router-dom";
import { Card } from "@/shared/components/ui/Card";

const shortcuts = [
  {
    to: "/admin/products",
    title: "Produtos",
    description: "Criar, editar e publicar itens do catálogo.",
  },
  {
    to: "/admin/content",
    title: "Conteúdo",
    description: "Textos institucionais, benefícios e FAQ da landing.",
  },
  {
    to: "/admin/contact",
    title: "Contato",
    description: "WhatsApp, e-mail, redes sociais e template de mensagem.",
  },
];

/**
 * Página inicial do painel com atalhos para cada área de gestão.
 */
export function DashboardPage() {
  return (
    <div className="space-y-4">
      <Card>
        <h1 className="font-display text-text text-2xl font-semibold">
          Dashboard
        </h1>
        <p className="text-secondary mt-2">
          Gerencie o catálogo, os textos institucionais e os dados de contato.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {shortcuts.map((shortcut) => (
          <Link
            key={shortcut.to}
            to={shortcut.to}
            className="bg-surface border-secondary/15 hover:border-primary/40 rounded-lg border p-6 shadow-sm transition-colors duration-150"
          >
            <h2 className="text-text font-medium">{shortcut.title}</h2>
            <p className="text-secondary mt-1 text-sm">
              {shortcut.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
