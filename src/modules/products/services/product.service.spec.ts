/**
 * Testes unitários do serviço de Produtos.
 *
 * Usa `mongodb-memory-server` para não depender do MongoDB local.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { AppError } from "../../../shared/errors/AppError";
import type { CreateProductDTO } from "../dto/product.dto";
import { ProductModel } from "../model/product.model";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from "./product.service";

const baseProduct: CreateProductDTO = {
  title: "Produto Teste",
  description: "Descrição detalhada do produto de teste para validação.",
  price: 29.9,
  category: "testes",
  featured: false,
  active: true,
};

describe("product.service", () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it("cria um produto com os dados informados", async () => {
    const product = await createProduct(baseProduct);

    expect(product.title).toBe("Produto Teste");
    expect(product.description).toContain("Descrição detalhada");
    expect(product.price).toBe(29.9);
    expect(product.category).toBe("testes");
    expect(product.featured).toBe(false);
    expect(product.active).toBe(true);
  });

  it("cria um produto sem imagem (campo opcional)", async () => {
    const withoutImage: CreateProductDTO = {
      title: baseProduct.title,
      description: baseProduct.description,
      price: baseProduct.price,
      category: baseProduct.category,
      featured: baseProduct.featured,
      active: baseProduct.active,
    };

    const product = await createProduct(withoutImage);

    expect(product.image).toBeUndefined();
  });

  it("lista produtos com busca case-insensitive", async () => {
    await createProduct({ ...baseProduct, title: "Fone Bluetooth" });
    await createProduct({ ...baseProduct, title: "Mouse Gamer" });
    await createProduct({ ...baseProduct, title: "Caixa Gamer" });

    const page = await listProducts({ page: 1, limit: 10, search: "gamer" });

    expect(page.items).toHaveLength(2);
    expect(page.total).toBe(2);
  });

  it("pagina os resultados com totalPages correto", async () => {
    for (let i = 1; i <= 3; i++) {
      await createProduct({ ...baseProduct, title: `Produto ${i}` });
    }

    const page = await listProducts({ page: 1, limit: 2 });

    expect(page.items).toHaveLength(2);
    expect(page.total).toBe(3);
    expect(page.totalPages).toBe(2);
    expect(page.page).toBe(1);
    expect(page.limit).toBe(2);
  });

  it("filtra produtos por categoria", async () => {
    await createProduct({ ...baseProduct, category: "eletronicos" });
    await createProduct({ ...baseProduct, category: "eletronicos" });
    await createProduct({ ...baseProduct, category: "moda" });

    const page = await listProducts({
      page: 1,
      limit: 10,
      category: "eletronicos",
    });

    expect(page.total).toBe(2);
    expect(page.items.map((item) => item.category)).toEqual([
      "eletronicos",
      "eletronicos",
    ]);
  });

  it("por padrão lista apenas produtos ativos", async () => {
    await createProduct({ ...baseProduct, title: "Ativo" });
    await createProduct({
      ...baseProduct,
      title: "Inativo",
      active: false,
    });

    const page = await listProducts({ page: 1, limit: 10 });

    expect(page.total).toBe(1);
    expect(page.items[0].title).toBe("Ativo");
  });

  it("filtra inativos quando active=false é informado", async () => {
    await createProduct({ ...baseProduct, title: "Ativo" });
    await createProduct({
      ...baseProduct,
      title: "Inativo",
      active: false,
    });

    const page = await listProducts({ page: 1, limit: 10, active: false });

    expect(page.total).toBe(1);
    expect(page.items[0].title).toBe("Inativo");
  });

  it("busca um produto pelo ID", async () => {
    const created = await createProduct(baseProduct);

    const product = await getProductById(created._id.toString());

    expect(product._id.toString()).toBe(created._id.toString());
    expect(product.title).toBe("Produto Teste");
  });

  it("rejeita ID inválido com AppError 400", async () => {
    await expect(getProductById("id-invalido")).rejects.toThrow(AppError);

    await expect(getProductById("id-invalido")).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("mantém produto inexistente com AppError 404", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    await expect(getProductById(fakeId)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("atualiza parcialmente um produto", async () => {
    const created = await createProduct(baseProduct);

    const updated = await updateProduct(created._id.toString(), {
      price: 39.9,
    });

    expect(updated.price).toBe(39.9);
    expect(updated.title).toBe("Produto Teste");
  });

  it("atualização de produto inexistente lança AppError 404", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    await expect(updateProduct(fakeId, { price: 39.9 })).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("remove um produto do catálogo", async () => {
    const created = await createProduct(baseProduct);

    await deleteProduct(created._id.toString());

    const count = await ProductModel.countDocuments();
    expect(count).toBe(0);
  });

  it("remoção de produto inexistente lança AppError 404", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    await expect(deleteProduct(fakeId)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
