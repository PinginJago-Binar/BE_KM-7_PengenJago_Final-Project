import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Create empty orderer
 * @returns {Promise<Object>}
 */
const createOrderer = async () => {
  return prisma.orderer.create({
    data: { fullname: '', email: '', numberPhone: '' },
  });
};

/**
 * Update data on specific orderer, by orderer_id
 * @param {number} ordererId 
 * @param {Object} data
 * @returns {Promise<Object>}
 */
const updateOrdererById = async (ordererId, data) => {
  return prisma.orderer.update({
    where: { id: ordererId },
    data
  });
}

/**
 * Get orderer by orderer id
 * @param {number} ordererId 
 * @returns {Promise<Object>}
 */
const getOrdererById = async (ordererId) => {
  return prisma.orderer.findUnique({ where: { id: ordererId } });
}

/**
 * Get orderer by booking code from orderer
 * @param {string} bookingCode
 * @returns 
 */
const getOrdererByBookingCode = async (bookingCode) => {
  return prisma.orderer.findFirst({ where: { bookingCode } });
}

export {
  createOrderer,
  updateOrdererById,
  getOrdererById,
  getOrdererByBookingCode
}