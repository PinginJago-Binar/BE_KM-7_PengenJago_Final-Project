import { Router } from 'express';
import { getHistory, historyDetail } from '../services/historyServices.js';
import errorHandler from '../middlewares/errorHandler.js';

const historyRoutes = new Router();

historyRoutes.get('/', async (req, res, next) => {
  try {
    const email = req.query.email;
    
    const history = await getHistory(email);
    return res.status(200).json(history);
  }catch (error) {
    return next(error);
  }    
});

historyRoutes.get('/detail/:transactionId', async (req, res, next) => {
    try {
        const { transactionId } = req.params;

        const detail = await historyDetail(transactionId);
        return res.status(200).json(detail);
    }catch (error) {
        return next(error);
    }
});

historyRoutes.use(errorHandler);

export default historyRoutes;