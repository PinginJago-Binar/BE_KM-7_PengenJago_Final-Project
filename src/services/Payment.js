import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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