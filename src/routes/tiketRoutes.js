import express from "express";
import { createTicket } from "../controllers/ticketController.js";
import { isAuthenticate } from "../middlewares/auth.js";

const tiketRouter = new express.Router();

tiketRouter.get('/:transactionId', isAuthenticate, createTicket)

export default tiketRouter;