import exampleRoutes from "./exampleRoutes.js";
import homepageRoutes from "./homepageRoutes.js";
import historyRoutes from "./historyRoutes.js";


const configureRoutes = (app) => { 
  
  app.use("/api/example", exampleRoutes);  
  // Dilanjutkan dengan endpoint anda seterusnya
  app.use('/api/homepage', homepageRoutes);  
  app.use('/api/history', historyRoutes);

};

export default configureRoutes;
