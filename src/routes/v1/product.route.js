const { Router } = require("express");
const { productController } = require("../../controllers/index");
const auth = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate");
const { productValidations } = require("../../validations");

const router = Router();

router
  .route("/")
  .get(auth("getAllProducts"), productController.getAllProducts)
  .post(
    auth("createProduct"),
    validate(productValidations.createProduct),
    productController.createProduct
  );

router
  .route("/:productId")
  .get(auth("getProduct"), productController.getProduct)
  .put(
    auth("updateProduct"),
    validate(productValidations.updateProduct),
    productController.updateProduct
  )
  .delete(auth("deleteProduct"), productController.deleteProduct);

module.exports = router;

/**
 * @swagger
 * tags:
 *    name: Products
 */

/**
 * @swagger
 * /v1/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve all products for all roles.
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         type: string
 *         description: The page number
 *       - in: query
 *         name: limit
 *         type: string
 *         description: The limit number of products
 *       - in: query
 *         name: sort
 *         type: string
 *         description: The sort field
 *       - in: query
 *         name: sortOrder
 *         type: string
 *         description: The sort order
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /v1/products:
 *   post:
 *    summary: Create a product
 *    tags: [Products]
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - name
 *              - price
 *              - description
 *              - quantity
 *            properties:
 *              name:
 *                type: string
 *              price:
 *                type: number
 *              description:
 *                type: string
 *              quantity:
 *                type: number
 *    responses:
 *      "201":
 *        description: Created
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                product:
 *                  $ref: '#/components/schemas/Product'
 *      "401":
 *        $ref: '#/components/responses/Unauthorized'
 *      "409":
 *        $ref: '#/components/responses/DuplicateProduct'
 *      "403":
 *        $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /v1/products/{productId}:
 *   get:
 *     summary: Get a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The product id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/ProductNotFound'
 *
 */

/**
 * @swagger
 *  /v1/products/{productId}:
 *    put:
 *      summary: Update a product
 *      tags: [Products]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: productId
 *          required: true
 *          schema:
 *            type: string
 *          description: The product id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                price:
 *                  type: number
 *                description:
 *                  type: string
 *                quantity:
 *                  type: number
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  product:
 *                    $ref: '#/components/schemas/Product'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/ProductNotFound'
 */

/**
 * @swagger
 *  /v1/products/{productId}:
 *    delete:
 *      summary: Delete a product
 *      tags: [Products]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: productId
 *          required: true
 *          schema:
 *            type: string
 *          description: The product id
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  product:
 *                    $ref: '#/components/schemas/Product'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/ProductNotFound'
 */

