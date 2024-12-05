import { Router } from 'express';
import { getDetailHistoryTransaction, getHistoryTransaction } from '../controllers/historyController.js';

const historyRoutes = new Router();

historyRoutes.get('/', getHistoryTransaction);
historyRoutes.get('/detail/:transactionId', getDetailHistoryTransaction);

export default historyRoutes;