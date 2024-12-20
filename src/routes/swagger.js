import swaggerUi from "swagger-ui-express";
import fs from "fs";

const swaggerFile = fs.readFileSync("./api-docs.json", "utf8");
const swaggerDocument = JSON.parse(swaggerFile);

const swagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

export default swagger;
