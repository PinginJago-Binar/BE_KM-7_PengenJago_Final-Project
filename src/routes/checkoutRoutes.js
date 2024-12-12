import { Router } from "express";
import { getBookingCheckoutDetails, createBookingCheckout, storeCheckoutPersonalData, processPayment, paymentNotif } from "../controllers/checkoutController.js";
import { isAuthenticate } from "../middlewares/auth.js";

const checkoutRoutes = new Router();

checkoutRoutes.get("/:userid/:transactionid", isAuthenticate, getBookingCheckoutDetails);
checkoutRoutes.post("/", isAuthenticate, createBookingCheckout);
checkoutRoutes.put("/", isAuthenticate, storeCheckoutPersonalData);
checkoutRoutes.post("/payment", processPayment);
checkoutRoutes.post("/notif/payment", paymentNotif);

export default checkoutRoutes;