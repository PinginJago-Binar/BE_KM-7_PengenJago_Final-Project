import { Router } from 'express';
import { getDetailHistoryTransaction, getHistoryTransaction } from '../controllers/historyController.js';
import { isAuthenticate } from "../middlewares/auth.js";

const historyRoutes = new Router();

historyRoutes.get('/', isAuthenticate, getHistoryTransaction);
historyRoutes.get('/detail/:transactionId', isAuthenticate,getDetailHistoryTransaction);

export default historyRoutes;