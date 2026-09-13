/**
 * Página de gestão de produtos do painel.
 *
 * Lista todos os produtos (ativos e inativos) com paginação, cria, edita e
 * remove via modal de formulário.
 */
import { useCallback, useEffect, useState } from "react";
import { ProductForm } from "@/features/products/components/ProductForm";
import type { ProductFormValues } from "@/features/products/schemas/product.form.schema";
import {
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminProducts,
  updateAdminProduct,
  type AdminProduct,
  type ProductPageData,
} from "@/features/products/services/product.service";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { Modal } from "@/shared/components/ui/Modal";
import { Spinner } from "@/shared/components/ui/Spinner";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type ModalState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; product: AdminProduct };

/**
 * Página de gestão de produtos do catálogo.
 */
export function ProductsPage() {
  const [data, setData] = useState<ProductPageData | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ kind: "closed" });

  const loadProducts = useCallback(async (targetPage: number) => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await fetchAdminProducts(targetPage, 10);
      setData(result);
      setPage(targetPage);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Erro ao carregar produtos.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Carregamento inicial: setState apenas em microtasks (fora do corpo sync
    // do effect) para evitar renders extras síncronos.
    let active = true;

    fetchAdminProducts(1, 10)
      .then((result) => {
        if (!active) return;
        setData(result);
        setPage(1);
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadError(
          error instanceof Error ? error.message : "Erro ao carregar produtos.",
        );
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(values: ProductFormValues) {
    if (modal.kind === "edit") {
      await updateAdminProduct(modal.product._id, values);
    } else {
      await createAdminProduct(values);
    }

    setModal({ kind: "closed" });
    await loadProducts(page);
  }

  async function handleDelete(product: AdminProduct) {
    const confirmed = window.confirm(`Remover o produto "${product.title}"?`);

    if (!confirmed) return;

    try {
      await deleteAdminProduct(product._id);
      await loadProducts(1);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Erro ao remover produto.",
      );
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Card className="flex-1">
          <h1 className="font-display text-text text-2xl font-semibold">
            Produtos
          </h1>
          <p className="text-secondary mt-1 text-sm">
            Crie e edite os itens exibidos no catálogo público.
          </p>
        </Card>
        <Button onClick={() => setModal({ kind: "create" })}>
          Novo produto
        </Button>
      </div>

      {loadError && <Alert variant="error">{loadError}</Alert>}

      {loading && !data ? (
        <div className="flex justify-center py-10">
          <Spinner className="text-primary size-6" />
        </div>
      ) : data ? (
        <>
          <Card className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-secondary border-secondary/15 border-b text-xs tracking-wide uppercase">
                    <th className="px-4 py-3">Produto</th>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3 text-right">Preço</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((product) => (
                    <tr
                      key={product._id}
                      className="border-secondary/10 border-b last:border-0"
                    >
                      <td className="text-text px-4 py-3 font-medium">
                        {product.title}
                      </td>
                      <td className="text-secondary px-4 py-3">
                        {product.category}
                      </td>
                      <td className="text-text px-4 py-3 text-right">
                        {currencyFormatter.format(product.price)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          <span
                            className={
                              product.active
                                ? "bg-success/10 text-success rounded-full px-2 py-0.5 text-xs font-medium"
                                : "bg-secondary/10 text-secondary rounded-full px-2 py-0.5 text-xs font-medium"
                            }
                          >
                            {product.active ? "Ativo" : "Inativo"}
                          </span>
                          {product.featured && (
                            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                              Destaque
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setModal({ kind: "edit", product })}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => void handleDelete(product)}
                          className="ml-1"
                        >
                          Excluir
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {data.items.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-secondary px-4 py-10 text-center"
                      >
                        Nenhum produto cadastrado ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => void loadProducts(page - 1)}
            >
              Anterior
            </Button>
            <span className="text-secondary text-sm">
              Página {data.page} de {data.totalPages || 1} · {data.total}{" "}
              produto(s)
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= data.totalPages || loading}
              onClick={() => void loadProducts(page + 1)}
            >
              Próxima
            </Button>
          </div>
        </>
      ) : null}

      <Modal
        open={modal.kind !== "closed"}
        title={modal.kind === "edit" ? "Editar produto" : "Novo produto"}
        onClose={() => setModal({ kind: "closed" })}
      >
        {modal.kind !== "closed" && (
          <ProductForm
            product={modal.kind === "edit" ? modal.product : null}
            onSubmit={handleSubmit}
            onCancel={() => setModal({ kind: "closed" })}
          />
        )}
      </Modal>
    </div>
  );
}
