const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { productsService } = require("../services");

const getAllProducts = catchAsync(async (req, res) => {
  const products = await productsService.getAllProducts(req.query);
  res.status(httpStatus.OK).json({ products });
});

const getProduct = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const product = await productsService.getProduct(productId);
  res.status(httpStatus.OK).json({ product });
});

const createProduct = catchAsync(async (req, res) => {
  const product = await productsService.createProduct(req.body);
  res.status(httpStatus.CREATED).json({ product });
});

const updateProduct = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const product = await productsService.updateProduct(productId, req.body);
  res.status(httpStatus.OK).json({ product });
});

const deleteProduct = catchAsync(async (req, res) => {
  const { productId } = req.params;
  await productsService.deleteProduct(productId);
  res.status(httpStatus.OK).json({ message: "Product deleted successfully" });
});

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
