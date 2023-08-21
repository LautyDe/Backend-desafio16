import "./dbTest.js";
import { expect } from "chai";
import supertest from "supertest";
import {
  generateDBProduct,
  generateTestProduct,
} from "../src/mock/mockProducts.test.js";

const request = supertest("http://localhost:8080");

describe("Testing de endpoints de PRODUCTS", function () {
  before(function () {});
  it("Debe retornar todos los productos del modelo Products GET de /api/products", async function () {
    const response = await request.get("/api/products");
    expect(response._body.status).to.be.equal("success");
    expect(response.statusCode).to.be.equal(200);
    expect(response._body).to.have.property("payload");
    expect(response._body.payload).to.be.an("array");
    expect(response._body.payload).length.to.be.greaterThan(0);
  });
  it("Debe agregar un producto a la base de datos POST de /api/products", async function () {
    const response = await request
      .post("/api/products")
      .send(generateTestProduct());
    expect(response._body).to.be.an("object");
    expect(response.statusCode).to.be.equal(201);
    expect(response._body).to.have.property("_id");
    expect(response._body).to.have.property("code");
  });
  it("Debe actualiar un producto PUT de /api/products/:pid", async function () {
    const createProduct = await request
      .post("/api/products")
      .send(generateTestProduct());
    const id = createProduct._body._id;
    const response = await request
      .put(`/api/products/${id}`)
      .send({ "price": 4500 });
    expect(response.statusCode).to.be.equal(200);
    expect(response._body.price).to.be.equal(4500);
  });
});

describe("Testing de endpoints de Carts", function () {
  let cid;
  let newCart;
  before(async function () {
    newCart = await request.post("/api/carts");
    cid = newCart._body._id;
  });
  afterEach(async function () {
    await request.delete(`/api/carts/${cid}`);
  });
  it("Debe retornar el carrito por id del modelo Carts GET de /api/carts/:cid", async function () {
    const response = await request.get(`/api/carts/${cid}`);
    expect(response.statusCode).to.be.equal(200);
    expect(response._body).to.have.property("_id");
    expect(response._body.products).to.be.an("array");
  });
  it("Debe agregar un producto al carrito POST /api/carts/:cid/product/:pid", async function () {
    const createProduct = await request
      .post("/api/products")
      .send(generateTestProduct());
    const pid = createProduct._body._id;
    const addedProduct = await request.post(`/api/carts/${cid}/product/${pid}`);
    expect(addedProduct.statusCode).to.be.equal(200);
    expect(addedProduct._body.products.length).to.be.equal(1);
    expect(addedProduct._body.products[0]).to.have.property("product");
    expect(addedProduct._body.products[0].quantity).to.be.equal(1);
  });
  it("Debe borrar todos los productos del carrito DELETE /api/carts/:cid", async function () {
    for (let i = 0; i < 3; i++) {
      const createProduct = await request
        .post("/api/products")
        .send(generateTestProduct());
      const pid = createProduct._body._id;
      const addedProduct = await request.post(
        `/api/carts/${cid}/product/${pid}`
      );
    }
    const checkCart = await request.get(`/api/carts/${cid}`);
    expect(checkCart._body.products.length).to.be.equal(3);
    const response = await request.delete(`/api/carts/${cid}`);
    expect(response._body.products.length).to.be.equal(0);
  });
});