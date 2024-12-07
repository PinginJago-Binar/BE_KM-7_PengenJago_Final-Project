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

const searchFlightService = async ({
  departure,
  destination,
  departureDate,
  returnDate, 
  passengers,
  seatClass,
}) => {
  try {
    // mengecek jumlah penumpang
    if (passengers > 9) {
      throw new Error('Maksimum 9 penumpang. (Dewasa dan Anak).');
    }

    // mencari penerbangan untuk departureDate
    const departureFlights = await prisma.flight.findMany({
      where: {
        departureAirport: {
          cityId: departure,
        },
        destinationAirport: {
          cityId: destination,
        },
        departureDate: departureDate,
        class: seatClass || 'economy',
      },
      include: { // data tambahan yang diambil 
        airplane: {
          include: {
            seat: true,
          },
        },
        departureAirport: true,
        destinationAirport: true,
        departureTerminal: true,
      },
    });

    // filter ketersedian kursi penerbangan untuk departureDate
    const filteredDepartureFlights = departureFlights.filter((flight) => {
      const availableSeats = flight.airplane.seat.filter(
        (seat) => seat.status === 'available'
      ).length;

      return availableSeats >= passengers;
    });

    let returnFlights = [];

    // mencari penerbangan untuk returnDate jika ada
    if (returnDate) {
      const returnResults = await prisma.flight.findMany({
        where: {
          departureAirport: {
            cityId: destination, 
          },
          destinationAirport: {
            cityId: departure,
          },
          departureDate: returnDate,
          class: seatClass || 'economy',
        },
        include: {
          airplane: {
            include: {
              seat: true,
            },
          },
          departureAirport: true,
          destinationAirport: true,
          departureTerminal: true,
        },
      });

      // filter ketersedia kursi penerbangan untuk returnDate
      returnFlights = returnResults.filter((flight) => {
        const availableSeats = flight.airplane.seat.filter(
          (seat) => seat.status === 'available'
        ).length;

        return availableSeats >= passengers;
      });
    }

    // map data penerbangan
    const mapFlights = (flights) =>
      flights.map((flight) => ({
        id: flight.id,
        airplaneId: flight.airplaneId,
        departureAirportId: flight.departureAirportId,
        destinationAirportId: flight.destinationAirportId,
        departureTerminalId: flight.departureTerminalId,
        departureDate: flight.departureDate,
        departureTime: flight.departureTime,
        arrivalDate: flight.arrivalDate,
        arrivalTime: flight.arrivalTime,
        class: flight.class,
        price: flight.price,
        availableSeats: flight.airplane.seat.filter(
          (seat) => seat.status === 'available'
        ).length,
      }));

    return {
      departureFlights: mapFlights(filteredDepartureFlights),
      returnFlights: mapFlights(returnFlights), 
    };
  } catch (error) {
    throw new Error(error.message || 'Terjadi kesalahan saat mengambil data penerbangan');
  }
};

const checkTicketService = async (departureFlightId, returnFlightId, seatClass, passengers) => {
  const checkFlightAvailability = async (flightId) => {
    const flight = await prisma.flight.findUnique({
      where: { id: flightId },
      include: {
        airplane: { include: { seat: true } },
      },
    });

    // jika penerbangan tidak tersedia di db
    if (!flight) {
      throw new Error('Penerbangan tidak ditemukan.');
    }

    const availableSeats = flight.airplane.seat.filter(
      (seat) => seat.status === 'available' && seat.class === seatClass
    );

    // ketersedian kursi lebih sedikit dari jumlah penumpang yang dibutuhkan
    if (availableSeats.length < passengers) {
      throw new Error("Kursi tidak cukup untuk jumlah penumpang.");
    }

    return availableSeats.length;
  };

  try {
    // cek penerbangan keberangkatan
    const departureSeats = await checkFlightAvailability(departureFlightId);

    let returnSeats = null;
    // cek penerbangan kembali jika ada
    if (returnFlightId) {
      returnSeats = await checkFlightAvailability(returnFlightId);
    }

    return {
      departureSeats,
      returnSeats,
    };
  } catch (error) {
    throw new Error(error.message || 'Terjadi kesalahan saat memeriksa ketersediaan tiket.');
  }
};

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
  searchFlightService,
  checkTicketService,
  getFlights
}