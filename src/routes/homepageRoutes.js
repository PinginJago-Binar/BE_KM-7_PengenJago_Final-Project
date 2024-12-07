import express from 'express';
import { searchFlightController, getCitiesController } from '../controllers/homepageController.js';

const homepageRouter = express.Router();

homepageRouter.get("/cities", getCitiesController);
homepageRouter.get("/search", searchFlightController);

export default homepageRouter;
