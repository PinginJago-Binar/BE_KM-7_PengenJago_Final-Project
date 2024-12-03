import exampleRoutes from "./exampleRoutes.js";
import checkoutRoutes from "./checkoutRoutes.js";

const configureRoutes = (app) => {
  app.use('/api/example', exampleRoutes);  
  app.use('/api/checkout', checkoutRoutes);
  // Dilanjutkan dengan endpoint anda seterusnya
};

export default configureRoutes;
