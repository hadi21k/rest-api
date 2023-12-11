const { faker } = require("@faker-js/faker");

const generateMockProduct = () => {
  return {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: faker.commerce.price(),
    quantity: faker.number.int({ min: 1, max: 10 }),
  };
};

function generateMockProducts(count) {
  const mockProducts = [];
  for (let i = 0; i < count; i++) {
    mockProducts.push(generateMockProduct());
  }
  return mockProducts;
}

module.exports = { generateMockProduct, generateMockProducts };
