const httpStatus = require("http-status");
const Product = require("../models/product.model");
const ApiError = require("../utils/ApiError");

const getAllProducts = async (queries) => {
  const page = parseInt(queries.page) || 1;
  const limit = parseInt(queries.limit) || 10;
  const sort = queries.sort || "price";
  const sortOrder =
    queries.sortOrder && queries.sortOrder.toLowerCase() === "desc" ? -1 : 1;

  const startIndex = (page - 1) * limit;

  const pipeline = [
    {
      $skip: startIndex,
    },
    {
      $limit: limit,
    },
    { $sort: { [sort]: sortOrder } },
    {
      $project: { __v: 0 },
    },
  ];

  return await Product.aggregate(pipeline);
};

const getProduct = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  return await Product.findById(productId, { __v: 0 });
};

const createProduct = async (product) => {
  const productExists = await Product.findOne({ name: product.name });

  if (productExists)
    throw new ApiError(httpStatus.CONFLICT, "Product already exist");

  return await Product.create(product);
};

const updateProduct = async (productId, product) => {
  const updatedProduct = await Product.findOneAndUpdate(
    { _id: productId },
    product,
    { projection: { __v: 0 }, new: true }
  );

  if (!updatedProduct)
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");

  return updatedProduct;
};

const deleteProduct = async (productId) => {
  const deletedProduct = await Product.findByIdAndDelete(productId, {
    projection: { __v: 0 },
  });

  if (!deletedProduct)
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
};

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
