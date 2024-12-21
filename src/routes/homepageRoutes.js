import express from 'express';
import { searchFlightController,  getCitiesController } from '../controllers/homepageController.js';
import { getFlightsController, getFavoriteDestinationController } from '../controllers/favoritedestinationController.js';

const homepageRouter = express.Router();

homepageRouter.get("/cities", getCitiesController);
homepageRouter.get("/flights", getFlightsController);
homepageRouter.get("/flights/favorites", getFavoriteDestinationController);
homepageRouter.get("/flights/search", searchFlightController);

export default homepageRouter;