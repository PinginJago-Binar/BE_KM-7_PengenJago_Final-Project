import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


/**
 * Create one or multiple passengers.
 * @param {boolean} isBulk - If `true`, inserts multiple passengers. If `false`, inserts a single passenger.
 * @param {Object|Array<Object>} data - passenger data
 * @returns {Promise<Object|Array<Object>>} - A promise that resolves to an array of passenger objects if `isBulk` is `true`, or a single passenger object if `isBulk` is `false`.
 */
const createPassenger = async (isBulk, data) => {
  return isBulk ? 
  prisma.passenger.createMany({ data })
  :
  prisma.passenger.create({ data })
}

/**
 * Mengelompokkan penumpang berdasarkan jenis
 * @param {number} ordererId 
 * @returns {Promise<Array<Object>>}
 */
const groupPassengersByType = async (ordererId) => {
  return await prisma.passenger.groupBy({        
    where: { orderedId: ordererId },
    by: ['passengerType'],
    _count: { passengerType: true },    
  });
}

const updatePassengers = async (ordererId, passengers) => {
  const updatePromises = passengers.map((passenger) => {
    const { passengerType, ...updateData } = passenger;

    return prisma.passenger.updateMany({
      where: {
        orderedId: ordererId,
        passengerType: passengerType,
      },
      data: updateData,
    });
  });
  
  await Promise.all(updatePromises);  
};

const getPassengerByOrdererId = (ordererId) => {
  return prisma.passenger.findMany({
    where: { orderedId: ordererId },
  });
}

export {
  getPassengerByOrdererId,
  createPassenger,
  groupPassengersByType,
  updatePassengers
}