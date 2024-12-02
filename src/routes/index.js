import homepageRoutes from "./homepageRoutes.js";

const configureRoutes = (app) => { 
  app.use('/api/homepage', homepageRoutes);  

};

export default configureRoutes;
