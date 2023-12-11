const allRoles = {
  user: ["getAllProducts", "getProduct"],
  admin: [
    "createProduct",
    "getAllProducts",
    "getProduct",
    "updateProduct",
    "deleteProduct",
  ],
};

const roles = Object.keys(allRoles);

const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
