import Joi from 'joi';
import asyncWrapper from '../utils/asyncWrapper.js'; 
import convertToJson from "../utils/convertToJson.js"; 
import { getFlights } from '../services/Flight.js';
import { getContinents } from '../services/Continent.js';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// controller untuk mengambil seluruh data penerbangan
const getFlightsController = asyncWrapper(async (req, res) => {
  const parsedBody = req.body;

  const criteria = {
    where: {
      departureAirport: { cityId: parsedBody.departure },
      destinationAirport: { cityId: parsedBody.destination },
      departureDate: {
        gte: parsedBody.departureDate,
        lte: parsedBody.departureDate,
      },
      price: {
        gte: parsedBody.minPrice,
      },
    },
    include: {
      airplane: {
        include: {
          seat: true,
        },
      },
      departureAirport: {
        include: {
          city: {
            include: {
              country: {
                include: {
                  continent: true,
                },
              },
            },
          },
        },
      },
      destinationAirport: {
        include: {
          city: {
            include: {
              country: {
                include: {
                  continent: true,
                },
              },
            },
          },
        },
      },
      departureTerminal: true,
    },
  };

  const flights = await getFlights(criteria);
  res.status(200).json({
    status: "success",
    data: convertToJson(flights),
  });
});

// controller untuk mengambil date benua
const getContinentsController = asyncWrapper(async (req, res) => {
  const continents = await getContinents();
  res.status(200).json({ 
    status: "success", 
    data: convertToJson(continents), 
  });
});

// schema validasi menggunakan Joi
const favoriteDestinationSchema = Joi.object({
  continent: Joi.number().required(), 
  selectedDate: Joi.date().optional(),
});

// controller untuk destinasi favorit berdasarkan benua
const getFavoriteDestinationController = asyncWrapper(async (req, res) => {
  const continent = req.query.continent;
  const selectedDate = req.query.date ? new Date(req.query.date) : new Date();

  // validasi input
  const parsedBody = { continent: parseInt(continent) };
  const { error } = favoriteDestinationSchema.validate(parsedBody);
  if (error) {
    return res.status(400).json({
      status: "error",
      message: error.details.map(err => err.message).join(', '),
    });
  }

  // tanggal filter
  const startDate = new Date(selectedDate);
  startDate.setDate(startDate.getDate() + 1); // dimulai dari esok hari

  // jika ada parameter `date` maka akan difilter hingga 10 hari kemudian
  const endDate = req.query.date ? new Date(startDate) : null;
  if (endDate) {
    endDate.setDate(endDate.getDate() + 10);
  }

  let whereCondition = {
    departureDate: {
      gte: startDate, // dimulai dari esok hari
    },
  };

  if (endDate) {
    whereCondition.departureDate.lte = endDate; // jika ada parameter `date` maka akan difilter hingga 10 hari kemudian
  }

  // filter berdasarkan continent jika diberikan
  if (continent && continent !== "0") {
    whereCondition.OR = [
      {
        departureAirport: {
          city: {
            country: {
              continent: {
                id: continent,
              },
            },
          },
        },
      },
      {
        destinationAirport: {
          city: {
            country: {
              continent: {
                id: continent,
              },
            },
          },
        },
      },
    ];
  }

  try {
    // mengambil data penerbangan
    const flights = await prisma.flight.findMany({
      include: {
        departureAirport: {
          include: {
            city: {
              include: {
                country: {
                  include: {
                    continent: true,
                  },
                },
              },
            },
          },
        },
        destinationAirport: {
          include: {
            city: {
              include: {
                country: {
                  include: {
                    continent: true,
                  },
                },
              },
            },
          },
        },
        airplane: {
          include: {
            airline: true,
            seat: true,
          },
        },
      },
      where: whereCondition,
    });

    // filter penerbangan berdasarkan kursi yang tersedia
    const filteredFlights = flights.filter((flight) => {
      const availableSeats = flight.airplane.seat.filter(seat => seat.status === 'available').length;
      return availableSeats > 0;
    });

    // mapping data penerbangan
    const result = filteredFlights.map((flight) => ({
      id: String(flight.id), 
      departureCity: flight.departureAirport.city.name,
      departureCityId: String(flight.departureAirport.city.id),
      destinationCity: flight.destinationAirport.city.name,
      destinationCityId: String(flight.destinationAirport.city.id),
      airline: flight.airplane.airline.name,
      airlineId: String(flight.airplane.airline.id),
      departureDate: flight.departureDate,
      arrivalDate: flight.arrivalDate,
      price: flight.price,
    })).sort((a, b) => a.price - b.price);

    // validasi jika tidak ada data penerbangan
    if (result.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Tidak ada penerbangan tersedia',
        data: [],
      });
    }

    // jika ada penerbangan ditemukan
    return res.status(200).json({
      status: 'success',
      message: 'Penerbangan ditemukan',
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
});

export {
  getFlightsController,
  getContinentsController,
  getFavoriteDestinationController
}