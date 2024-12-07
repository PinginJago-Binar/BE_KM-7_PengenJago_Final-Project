import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Mengambil data kota dari database
 * @returns {Promise<Object[]>} Data kota
 */
const getCityData = async () => {
  return await prisma.city.findMany({
    include: {
      country: true,
    },
  });
};

/**
 * Fungsi untuk mengambil data penerbangan berdasarkan kriteria tertentu
 * @param {Object} criteria - Kriteria untuk memfilter penerbangan
 * @returns {Promise<Array>} 
 */
const getFlightData = async (criteria) => {
  return await prisma.flight.findMany(criteria);
};

export {
  getFlightData,
  getCityData
};
