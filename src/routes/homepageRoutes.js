import express from 'express';
import searchFlightController from '../controllers/homepageController.js';

const homepageRouter = express.Router();

homepageRouter.get("/search", searchFlightController);

export default homepageRouter;
