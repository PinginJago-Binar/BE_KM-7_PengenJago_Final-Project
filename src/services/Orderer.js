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


export {
  createOrderer,
  updateOrdererById
}