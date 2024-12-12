import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


const createTransaction = async (data) => {
  return prisma.transaction.create({ data });
}

/**
 * Get transaction by user id
 * @param {number} transactionId 
 */
const getTransactionById = async (transactionId) => {
  return prisma.transaction.findUnique({ 
    where: { id: transactionId } }
  );
}

/**
 * Get transaction by transaction id and user id
 * @param {number} transactionId 
 * @param {number} userId 
 * @returns 
 */
const getTransactionByIdAndUser = async (transactionId, userId) => {
  return prisma.transaction.findUnique({
    where: {    
      id: transactionId,
      userId: userId,      
    },
  });
};

/**
 * Get transaction by user id
 * @param {number} userId 
 * @returns 
 */
const getHistoryAndDetail = async (userId) => {
  return prisma.transaction.findMany({
    where: {
      userId: BigInt(userId),
      order: {
        bookingCode: { not: null, },
      },
    },
    select: {
      id: true,
      status: true,
      amount: true,
      amountAfterTax: true,
      order : {
        select: {
            id: true,
            bookingCode: true,
            pasengger: {
                select: {
                    passengerType: true,
                    
                    fullname: true,
                    familyName: true,
                },
            },
        },
      },
      departureFlight: {        
        select: {
          airplane: {
            select: {
              airplaneCode: true,
              airline: {
                select: {
                  name: true,
                  logo: true,
                },
              },
            },
          },
          price: true,
          class: true,
          departureTerminal: {
            select: { 
              name: true, 
            },
          },
          departureDate: true,
          departureTime: true,
          arrivalDate: true,
          arrivalTime: true,
          departureAirport: {
            select: {
              name: true,
              city: {
                select:{
                  name: true,
                },
              },
            },
          },
          destinationAirport: {
            select: {
              name: true,
              city: {
                select:{
                  name: true,
                },
              },
            },
          },
        },
      },
      returnFlight: {
        select: {
          airplane: {
            select: {
              airplaneCode: true,
              airline: {
                select: {
                  name: true,
                  logo: true,
                },
              },
            },
          },
          price: true,
          departureTerminal: {
            select: {
              name: true,
            },
          },
          class: true,
          departureDate: true,
          departureTime: true,
          arrivalDate: true,
          arrivalTime: true,
          departureAirport: {
            select: {
              name: true,
              city: {
                select:{
                  name: true,
                },
              },
            },
          },
          destinationAirport: {
            select: {
              name: true,
              city: {
                select: {
                  name: true,
                }
              }
            },
          },
        },
      },
    },
  });
};

/**
 * 
 * @param {number} ordererId 
 * @returns 
 */
const getTransactionByOrdererId = async (ordererId) => {
  return prisma.transaction.findFirst({ where: { ordererId } });
}

const updateTransactionById = async (transactionId, data) => {
  return prisma.transaction.update({
    where: { id: transactionId },
    data
  });
}

export {
  createTransaction,
  getTransactionById,
  getTransactionByIdAndUser,
  getHistoryAndDetail,
  getTransactionByOrdererId,
  updateTransactionById
}