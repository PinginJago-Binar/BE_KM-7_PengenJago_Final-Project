import express from "express";
import cors from "cors";
import morgan from "morgan";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(errorHandler);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello, world!" });
});

export default app;
