import express from 'express';
import { getHomepage, searchFlightControll, ticketControll } from '../controllers/homepageController.js';

const homepageRouter = express.Router();

homepageRouter.get("/", getHomepage);
homepageRouter.post("/search-flights", searchFlightControll);
homepageRouter.get("/status-ticket/:flightId/:returnFlightId?", ticketControll);

export default homepageRouter;
