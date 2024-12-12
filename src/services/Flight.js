import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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

/**
 * Get detail flight By Id
 * @param {number} flightId 
 * @returns async object literal
 */
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

/**
 * Fungsi untuk mengambil data penerbangan berdasarkan kriteria tertentu
 * @param {Object} criteria - Kriteria untuk memfilter penerbangan
 * @returns {Promise<Array>} 
 */
const getFlights = async (criteria) => {
  return await prisma.flight.findMany(criteria);  
}

export {
  getFlightById,
  getDetailFlightById,
  getFlights
}