const { Router } = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const options = require("../../utils/swagger");

const router = Router();

const swaggerSpec = swaggerJsdoc(options);

router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Docs in json format
router.get("/", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

module.exports = router;
