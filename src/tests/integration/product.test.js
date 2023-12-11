const httpStatus = require("http-status");
const request = require("supertest");
const app = require("../../app");
const { insertUsers, userOne, admin } = require("../fixtures/user.fixture");
const {
  userOneAccessToken,
  adminAccessToken,
} = require("../fixtures/token.fixture");
const setUpTestDB = require("../utils/setupTestDB");
const Product = require("../../models/product.model");
const {
  generateMockProducts,
  generateMockProduct,
} = require("../fixtures/product.fixture");
const { mongoose } = require("mongoose");

setUpTestDB();

describe("Products Route", () => {
  describe("GET /products", () => {
    beforeEach(async () => {
      const mockProducts = generateMockProducts(15);
      await Product.create(mockProducts);
    });

    afterEach(async () => {
      await Product.deleteMany();
    });
    test("Should return products with limit 10 and sorted with names if no queries are set by default", async () => {
      await insertUsers([userOne]);
      const response = await request(app)
        .get("/v1/products")
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(response.body.products).toHaveLength(10);

      const sortedProducts = response.body.products.sort((a, b) => {
        return b.price - a.price;
      });

      expect(response.body.products).toEqual(sortedProducts);

      response.body.products.forEach((product) => {
        expect(product).toMatchObject({
          _id: expect.anything(),
          name: expect.anything(),
          price: expect.anything(),
          description: expect.anything(),
        });
      });
    });

    test("Should return products with correct pagination, sorting and limit", async () => {
      await insertUsers([userOne]);

      let page = 2;
      const limit = 5;
      const sort = "name";
      const sortOrder = "asc";

      const response = await request(app)
        .get(
          `/v1/products?page=${page}&limit=${limit}&sort=${sort}&sortOrder=${sortOrder}`
        )
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(response.body.products).toHaveLength(limit);

      const sortedProducts = response.body.products.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });

      expect(response.body.products).toEqual(sortedProducts);

      response.body.products.forEach((product) => {
        expect(product).toMatchObject({
          _id: expect.anything(),
          name: expect.anything(),
          price: expect.anything(),
          description: expect.anything(),
        });
      });
    });

    test("Should return 401 if access token not found", async () => {
      await insertUsers([userOne]);
      const page = 2;
      const limit = 5;
      const sort = "name";
      const sortOrder = "asc";

      await request(app)
        .get(
          `/v1/products?page=${page}&limit=${limit}&sort=${sort}&sortOrder=${sortOrder}`
        )
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe("GET /products/:productId", () => {
    test("Should return product with correct id", async () => {
      await insertUsers([userOne]);
      const mockProducts = generateMockProducts(1);
      const product = await Product.create(mockProducts);

      const response = await request(app)
        .get(`/v1/products/${product[0]._id}`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(response.body.product).toMatchObject({
        _id: product[0]._id.toHexString(),
        name: product[0].name,
        price: product[0].price,
        description: product[0].description,
      });
    });

    test("Should return 404 if product not found", async () => {
      await insertUsers([userOne]);
      const productId = new mongoose.Types.ObjectId("5f4f0d1bd1e8c7228250f2d3");

      await request(app)
        .get(`/v1/products/${productId}`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe("POST /products", () => {
    test("Should create a new product", async () => {
      await insertUsers([admin]);
      const product = generateMockProduct();

      const response = await request(app)
        .post("/v1/products")
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send(product)
        .expect(httpStatus.CREATED);

      expect(response.body.product).toMatchObject({
        name: product.name,
        price: parseInt(product.price),
        description: product.description,
        quantity: product.quantity,
      });
    });

    test("Should return 409 if product already exists", async () => {
      await insertUsers([admin]);
      const product = generateMockProduct();
      await Product.create(product);
      await request(app)
        .post("/v1/products")
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send(product)
        .expect(httpStatus.CONFLICT);
    });

    test("Should return 403 if user not an admin", async () => {
      await insertUsers([userOne]);
      const product = generateMockProduct();

      await request(app)
        .post("/v1/products")
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send(product)
        .expect(httpStatus.FORBIDDEN);
    });

    test("Should return 400 if any value not included in the product body", async () => {
      await insertUsers([admin]);
      const product = generateMockProduct();
      delete product.name;

      await request(app)
        .post("/v1/products")
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send(product)
        .expect(httpStatus.BAD_REQUEST);

      product.name = "Product Name";
      delete product.price;

      await request(app)
        .post("/v1/products")
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send(product)
        .expect(httpStatus.BAD_REQUEST);

      product.price = "100";
      delete product.description;

      await request(app)
        .post("/v1/products")
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send(product)
        .expect(httpStatus.BAD_REQUEST);

      product.description = "Product Description";
      delete product.quantity;

      await request(app)
        .post("/v1/products")
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send(product)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe("PUT /products/:productId", () => {
    afterEach(async () => {
      await Product.deleteMany();
    });
    test("Should return 200 if product is updated", async () => {
      await insertUsers([admin]);
      const product = generateMockProduct();
      const productDoc = await Product.create(product);
      const updatedProduct = generateMockProduct();

      const reponse = await request(app)
        .put(`/v1/products/${productDoc._id}`)
        .send(updatedProduct)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .expect(httpStatus.OK);

      expect(reponse.body.product).toMatchObject({
        _id: expect.anything(),
        name: updatedProduct.name,
        price: parseInt(updatedProduct.price),
        description: updatedProduct.description,
        quantity: updatedProduct.quantity,
      });
    });

    test("Should return 400 if any property is missed", async () => {
      await insertUsers([admin]);
      const product = generateMockProduct();
      await Product.create(product);
      const updatedProduct = generateMockProduct();
      delete updatedProduct.name;

      await request(app)
        .put(`/v1/products/${product._id}`)
        .send(updatedProduct)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .expect(httpStatus.BAD_REQUEST);

      updatedProduct.name = "Product Name";
      delete updatedProduct.price;

      await request(app)
        .put(`/v1/products/${product._id}`)
        .send(updatedProduct)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .expect(httpStatus.BAD_REQUEST);
    });

    test("Should 403 if user is not admin", async () => {
      await insertUsers([userOne]);
      const product = generateMockProduct();
      await Product.create(product);
      const updatedProduct = generateMockProduct();

      await request(app)
        .put(`/v1/products/${product._id}`)
        .send(updatedProduct)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.FORBIDDEN);
    });

    test("Should return 500 if product not found", async () => {
      await insertUsers([admin]);
      const product = generateMockProduct();
      const updatedProduct = generateMockProduct();

      await request(app)
        .put(`/v1/products/${product._id}`)
        .send(updatedProduct)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .expect(httpStatus.INTERNAL_SERVER_ERROR);
    });

    test("Should return 404 if no product is found", async () => {
      await insertUsers([admin]);
      const productId = new mongoose.Types.ObjectId("5f4f0d1bd1e8c7228250f2d3");
      const updatedProduct = generateMockProduct();

      await request(app)
        .put(`/v1/products/${productId}`)
        .send(updatedProduct)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe("DELETE /products/:productId", () => {
    afterEach(async () => {
      await Product.deleteMany();
    });
    test("Should return 200 if product is deleted", async () => {
      await insertUsers([admin]);
      const product = generateMockProduct();
      const productDoc = await Product.create(product);

      const response = await request(app)
        .delete(`/v1/products/${productDoc._id}`)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .expect(httpStatus.OK);
      expect(response.body.message).toEqual("Product deleted successfully");
    });

    test("Should return 403 if user is not admin", async () => {
      await insertUsers([userOne]);
      const product = generateMockProduct();
      const productDoc = await Product.create(product);

      await request(app)
        .delete(`/v1/products/${productDoc._id}`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.FORBIDDEN);
    });

    test("Should return 404 if product not found", async () => {
      await insertUsers([admin]);
      const productId = new mongoose.Types.ObjectId("5f4f0d1bd1e8c7228250f2d3");

      await request(app)
        .delete(`/v1/products/${productId}`)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .expect(httpStatus.NOT_FOUND);
    });
  });
});
