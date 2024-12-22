import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Ambil semua benua beserta negara terkaitnya.
 * @returns {Promise<Array>} Daftar benua beserta negaranya
 */
const getContinents = async () => {
  return prisma.continent.findMany({
    include: {
      country: true, 
    },
  });
};

export {
  getContinents
}
