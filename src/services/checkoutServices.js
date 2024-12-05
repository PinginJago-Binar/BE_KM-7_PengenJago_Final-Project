import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();
// Flight

/**
 * Get flight by id
 * @param {number} flightId 
 * @returns async object literal
 */
const getFlightById = async (flightId) => {
  return prisma.flight.findUnique({
    where: { id: flightId },
  })
}

const getDetailFlightById = async (flightId) => {
  return prisma.flight.findFirst({ 
    where: { id: flightId },
    include: {
      departureAirport: true,
      returnFlight: true,
      departureTerminal: true,
      airplane: {
        include: {
          airline: true,
          seat: true
        }
      }
    }
  });  
}



// Seat
const getAvailableTickets = async (airplaneId) => {
  return prisma.seat.count({
    where: { airplaneId, status: 'available' },
  });
};
/**
 * Mark seats as booked by updating their status in the database
 * @param {Array<number>} seatIds - List of seat IDs to be updated
 * @returns {Promise<number>} - Count of updated rows
 */
const markSeatsAsBooked = async (seatIds) => {
  const updatedSeats = await prisma.seat.updateMany({
    where: {
      id: {
        in: seatIds,
      },
    },
    data: {
      status: 'booked',
    },
  });

  return updatedSeats.count; // Return number of rows updated
};
const getSeatByIds = async (ids) => {
  return prisma.seat.findMany({
    where: { id: { in: ids } },
  });
}


// Orderer
const createOrderer = async () => {
  return prisma.orderer.create({
    data: { fullname: '', email: '', numberPhone: '' },
  });
}

// Passenger
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

// Transacation
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

export {
  getFlightById,
  getAvailableTickets,
  getDetailFlightById,
  getTransactionById,
  getTransactionByIdAndUser,
  getPassengerByOrdererId,
  getSeatByIds,
  createOrderer,  
  createPassenger,
  createTransaction,
  groupPassengersByType,
  updatePassengers,
  markSeatsAsBooked
}