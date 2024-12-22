import checkoutRoutes from "./checkoutRoutes.js";
import homepageRoutes from "./homepageRoutes.js";
import historyRoutes from "./historyRoutes.js";
import userRoutes from "./userRoutes.js";
import authRoutes from "./authRoutes.js";
import notificationRouter from "./notificationRoutes.js";
import tiketRouter from "./tiketRoutes.js";

const configureRoutes = (app) => { 
  
  app.use('/api', homepageRoutes);  
  app.use('/api/history', historyRoutes);
  app.use('/api/checkout', checkoutRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/auth", authRoutes);
  app.use('/api/notification', notificationRouter);
  app.use('/api/tickets', tiketRouter)

};

export default configureRoutes;
