import { getHistory, historyDetail } from "../services/Transaction.js";
import asyncWrapper from "../utils/asyncWrapper.js";

const getHistoryTransaction = asyncWrapper(async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({message: 'Email is required'})
  }
    
  const history = await getHistory(email);
  res.status(200).json(history);
});

const getDetailHistoryTransaction = asyncWrapper(async (req, res) => {
  const { transactionId } = req.params;

  const detail = await historyDetail(transactionId);

  res.status(200).json(detail);
})


export {
  getHistoryTransaction,
  getDetailHistoryTransaction
}