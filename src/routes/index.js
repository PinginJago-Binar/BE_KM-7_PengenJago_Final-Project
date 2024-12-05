import checkoutRoutes from "./checkoutRoutes.js";
import homepageRoutes from "./homepageRoutes.js";
import historyRoutes from "./historyRoutes.js";

const configureRoutes = (app) => { 
  
  app.use('/api/homepage', homepageRoutes);  
  app.use('/api/history', historyRoutes);
  app.use('/api/checkout', checkoutRoutes);

};

export default configureRoutes;
