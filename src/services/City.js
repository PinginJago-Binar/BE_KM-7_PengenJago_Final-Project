import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


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