/**
 * Formulário de criação/edição de produto com validação Zod na borda.
 */
import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  productFormSchema,
  type ProductFormValues,
} from "@/features/products/schemas/product.form.schema";
import type { AdminProduct } from "@/features/products/services/product.service";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Label } from "@/shared/components/ui/Label";
import { Spinner } from "@/shared/components/ui/Spinner";
import { Textarea } from "@/shared/components/ui/Textarea";

interface ProductFormProps {
  /** Produto em edição (ou `null` para criação). */
  product: AdminProduct | null;
  /** Callback de salvamento (lança erro para exibição no formulário). */
  onSubmit: (values: ProductFormValues) => Promise<void>;
  /** Cancela e fecha o formulário. */
  onCancel: () => void;
}

type FormState = {
  title: string;
  description: string;
  price: string;
  priceOriginal: string;
  category: string;
  featured: boolean;
  active: boolean;
};

function toFormState(product: AdminProduct | null): FormState {
  if (!product) {
    return {
      title: "",
      description: "",
      price: "",
      priceOriginal: "",
      category: "",
      featured: false,
      active: true,
    };
  }

  return {
    title: product.title,
    description: product.description,
    price: String(product.price),
    priceOriginal:
      product.priceOriginal != null ? String(product.priceOriginal) : "",
    category: product.category,
    featured: product.featured,
    active: product.active,
  };
}

/**
 * Formulário de produto (criação e edição).
 *
 * @param props - Produto em edição, callback de submit e de cancelamento.
 */
export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(product));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function setField<Key extends keyof FormState>(
    key: Key,
    value: FormState[Key],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = productFormSchema.safeParse(form);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Verifique os dados.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(parsed.data);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Erro ao salvar.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <Label htmlFor="product-title">Título</Label>
        <Input
          id="product-title"
          value={form.title}
          onChange={(event) => setField("title", event.target.value)}
          placeholder="Ex: Fone Bluetooth"
          required
        />
      </div>

      <div>
        <Label htmlFor="product-description">Descrição</Label>
        <Textarea
          id="product-description"
          value={form.description}
          onChange={(event) => setField("description", event.target.value)}
          placeholder="Descrição detalhada do produto..."
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="product-price">Preço (R$)</Label>
          <Input
            id="product-price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(event) => setField("price", event.target.value)}
            placeholder="49,90"
            required
          />
        </div>
        <div>
          <Label htmlFor="product-price-original">Preço original (R$)</Label>
          <Input
            id="product-price-original"
            type="number"
            step="0.01"
            min="0"
            value={form.priceOriginal}
            onChange={(event) => setField("priceOriginal", event.target.value)}
            placeholder="Opcional"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="product-category">Categoria</Label>
        <Input
          id="product-category"
          value={form.category}
          onChange={(event) => setField("category", event.target.value)}
          placeholder="Ex: eletrônicos, moda, casa"
          required
        />
      </div>

      <fieldset className="flex flex-wrap items-center gap-6">
        <label className="text-text flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setField("featured", event.target.checked)
            }
            className="size-4 accent-[var(--color-primary)]"
          />
          Em destaque
        </label>
        <label className="text-text flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setField("active", event.target.checked)
            }
            className="size-4 accent-[var(--color-primary)]"
          />
          Publicado no catálogo
        </label>
      </fieldset>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Spinner />}
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
