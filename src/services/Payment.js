import { prisma } from "../config/db.js";

const createPaymentDetail = async (data) =>  {
  return prisma.paymentDetail.create({ data });
}

const getPaymentDetailByTransactionId = async (transactionId) => {
  return prisma.paymentDetail.findFirst({ where: { transactionId } });
}

export {
  createPaymentDetail,
  getPaymentDetailByTransactionId
}