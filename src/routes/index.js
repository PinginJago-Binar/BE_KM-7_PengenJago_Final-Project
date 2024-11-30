import exampleRoutes from "./exampleRoutes.js";
import userRoutes from "./userRoutes.js";
import authRoutes from "./authRoutes.js";

const configureRoutes = (app) => {
  app.use("/api/example", exampleRoutes);
  app.use("/api", userRoutes);
  app.use("/api/auth", authRoutes);

  // Dilanjutkan dengan endpoint anda seterusnya
};

export default configureRoutes;
