import { Router } from "express";
import { getBookingCheckoutDetails, createBookingCheckout, storeCheckoutPersonalData } from "../controllers/checkoutController.js";

const checkoutRoutes = new Router();

checkoutRoutes.get("/:userid/:transactionid", getBookingCheckoutDetails);
checkoutRoutes.post("/", createBookingCheckout);
checkoutRoutes.put("/", storeCheckoutPersonalData);

export default checkoutRoutes;