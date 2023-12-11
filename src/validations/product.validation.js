const Joi = require("joi");

const createProduct = {
  body: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required(),
    quantity: Joi.number().required(),
  }),
};

const updateProduct = {
  params: Joi.object({
    productId: Joi.string().required(),
  }),
  body: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required(),
    quantity: Joi.number().required(),
  }),
};

const deleteProduct = {
  params: Joi.object({
    productId: Joi.string().required(),
  }),
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
};
