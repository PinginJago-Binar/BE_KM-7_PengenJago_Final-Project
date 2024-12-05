import { Router } from "express";
import { getBookingCheckoutDetails, createBookingCheckout, storeCheckoutPersonalData } from "../controllers/checkoutController.js";
import { isAuthenticate } from "../middlewares/auth.js";

const checkoutRoutes = new Router();

checkoutRoutes.get("/:userid/:transactionid", isAuthenticate, getBookingCheckoutDetails);
checkoutRoutes.post("/", isAuthenticate, createBookingCheckout);
checkoutRoutes.put("/", isAuthenticate, storeCheckoutPersonalData);

export default checkoutRoutes;