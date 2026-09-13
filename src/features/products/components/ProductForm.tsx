/**
 * Formulário de criação/edição de produto com validação Zod na borda
 * e upload assinado de imagem para o Cloudinary.
 */
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  productFormSchema,
  type ProductFormValues,
} from "@/features/products/schemas/product.form.schema";
import type { AdminProduct } from "@/features/products/services/product.service";
import type { AdminProductImage } from "@/features/products/services/product.service";
import {
  uploadProductImage,
  type UploadedProductImage,
} from "@/features/products/services/upload.service";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Label } from "@/shared/components/ui/Label";
import { Spinner } from "@/shared/components/ui/Spinner";
import { Textarea } from "@/shared/components/ui/Textarea";

interface ProductFormProps {
  /** Produto em edição (ou `null` para criação). */
  product: AdminProduct | null;
  /** Callback de salvamento. */
  onSubmit: (values: ProductFormValues) => Promise<void>;
  /** Cancela a operação. */
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
  /** Imagem principal do produto (Cloudinary) — opcional. */
  image: AdminProductImage | null;
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
      image: null,
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
    image: product.image ?? null,
  };
}

/**
 * Formulário de produto com upload de imagem.
 */
export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(product));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  /** Altera um único campo do estado do formulário. */
  function setField<Key extends keyof FormState>(
    key: Key,
    value: FormState[Key],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /** Envia a imagem selecionada direto para o Cloudinary. */
  async function handleImageSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const uploaded: UploadedProductImage = await uploadProductImage(file);
      setField("image", {
        publicId: uploaded.publicId,
        url: uploaded.url,
      });
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Não foi possível enviar a imagem.",
      );
    } finally {
      setUploading(false);
    }
  }

  /** Remove a imagem do produto (não envia `null` ao backend). */
  function handleImageRemove() {
    setField("image", null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = productFormSchema.safeParse(form);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Verifique os dados.");
      return;
    }

    const { image, ...rest } = parsed.data;
    const payload = image
      ? { ...rest, image: { publicId: image.publicId, url: image.url } }
      : rest;

    setLoading(true);
    try {
      await onSubmit(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível salvar o produto.",
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
          placeholder="Descreva o produto em detalhes..."
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

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="product-image">Imagem do produto</Label>
          {form.image && (
            <button
              type="button"
              onClick={handleImageRemove}
              className="text-secondary hover:text-danger text-sm underline"
            >
              Remover imagem
            </button>
          )}
        </div>

        {form.image ? (
          <div className="mt-2 flex items-center gap-3">
            <img
              src={form.image.url}
              alt="Prévia da imagem do produto"
              className="border-secondary/30 h-16 w-16 rounded-md border object-cover"
            />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="text-primary text-sm underline hover:underline-offset-2"
            >
              Substituir imagem
            </button>
          </div>
        ) : (
          <div className="mt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading && <Spinner className="mr-2 size-4" />}
              {uploading ? "Enviando..." : "Enviar imagem"}
            </Button>
          </div>
        )}

        <input
          ref={imageInputRef}
          id="product-image"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />
      </div>

      <fieldset className="flex flex-wrap items-center gap-6">
        <legend className="sr-only">Configurações do produto</legend>
        <label className="text-text flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) => setField("featured", event.target.checked)}
            className="size-4 accent-[var(--color-primary)]"
          />
          Em destaque
        </label>
        <label className="text-text flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) => setField("active", event.target.checked)}
            className="size-4 accent-[var(--color-primary)]"
          />
          Publicado
        </label>
      </fieldset>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading && <Spinner className="mr-2 size-4" />}
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
