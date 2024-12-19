import express from "express";
import cors from "cors";
import morgan from "morgan";
import expressEjsLayouts from "express-ejs-layouts";
import errorHandler from "./middlewares/errorHandler.js";
import configureRoutes from "./routes/index.js";
import path from "path";

const app = express();

// EJS View Engine
app.set("views", path.join("./views"));
app.set("view engine", "ejs");
app.use(expressEjsLayouts);

app.use(morgan("combined"));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// routes
configureRoutes(app);
app.get("/api/nice", async (req, res) => {
  res.status(200).json({
    message: "nice brok"
  });
});

app.use(errorHandler);

export default app;
