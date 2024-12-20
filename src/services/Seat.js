import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


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

/**
 * Mark seats as booked by updating their status in the database
 * @param {Array<number>} seatIds - List of seat IDs to be updated
 * @returns {Promise<number>} - Count of updated rows
 */
const markSeatsAsAvailable = async (seatIds) => {
  const updatedSeats = await prisma.seat.updateMany({
    where: {
      id: {
        in: seatIds,
      },
    },
    data: {
      status: 'available',
    },
  });

  return updatedSeats.count; // Return number of rows updated
};

const getSeatByIds = async (ids) => {
  return prisma.seat.findMany({
    where: { id: { in: ids } },
  });
}

export {
  markSeatsAsBooked,
  markSeatsAsAvailable,
  getAvailableTickets,
  getSeatByIds
}