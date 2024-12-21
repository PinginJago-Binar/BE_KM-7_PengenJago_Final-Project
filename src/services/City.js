import { prisma } from "../config/db.js";


/**
 * Mengambil data kota dari database
 * @returns {Promise<Object[]>} Data kota
 */
const getCities = async () => {
  return await prisma.city.findMany({
    include: {
      country: true,
    },
  });
};

export {
  getCities
}