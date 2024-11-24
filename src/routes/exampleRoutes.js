import { Router } from "express";
import { createExample, filterExample } from "../controllers/exampleController.js";

const exampleRoutes = new Router();

exampleRoutes.post("/", createExample);
exampleRoutes.get("/filter-example", filterExample);

export default exampleRoutes;