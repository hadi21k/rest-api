const { Router } = require("express");
const authRoute = require("./auth.route");
const productRoute = require("./product.route");
const docsRoute = require("./docs.route");

const router = Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/products",
    route: productRoute,
  },
  {
    path: "/docs",
    route: docsRoute,
  },
];

router.get("/", (req, res) => {
  res.json({
    message: "Hello",
  });
});

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;