import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Fungsi untuk mengambil data penerbangan berdasarkan kriteria tertentu
 * @param {Object} criteria - Kriteria untuk memfilter penerbangan
 * @returns {Promise<Array>} 
 */
const getFlightData = async (criteria) => {
  return await prisma.flight.findMany(criteria);
};

export default getFlightData;
