import express from 'express';
import { getHomepage, searchFlightControll, ticketControll } from '../controllers/homepageController.js';

const router = express.Router();

router.get("/", getHomepage);
router.post("/search-flights", searchFlightControll);
router.get("/status-ticket/:flightId/:returnFlightId?", ticketControll);

export default router;
