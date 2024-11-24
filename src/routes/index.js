import exampleRoutes from "./exampleRoutes.js";

const configureRoutes = (app) => {
  app.use('/api/example', exampleRoutes);  

  // Dilanjutkan dengan endpoint anda seterusnya
};

export default configureRoutes;
