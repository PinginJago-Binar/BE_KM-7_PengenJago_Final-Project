import { Router } from 'express';
import { getHistoryTransactionAndDetail } from '../controllers/historyController.js';
import { isAuthenticate } from "../middlewares/auth.js";

const historyRoutes = new Router();

historyRoutes.get('/:userId', isAuthenticate, getHistoryTransactionAndDetail);

export default historyRoutes;