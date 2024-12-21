import Joi from 'joi';
import asyncWrapper from '../utils/asyncWrapper.js'; 
import convertToJson from "../utils/convertToJson.js"; 
import { getFlights } from '../services/Flight.js';

// schema validasi menggunakan Joi
const favoriteDestinationSchema = Joi.object({
  departure: Joi.number().required(),
  destination: Joi.number().required(),
  startDate: Joi.date().required(),  
  endDate: Joi.date().required(),    
  minPrice: Joi.number().required(),
});

// controller untuk mendapatkan seluruh data penerbangan
const getFlightsController = asyncWrapper(async (req, res) => {
  const parsedBody = req.body;

  const criteria = {
    where: {
      departureAirport: { cityId: parsedBody.departure },
      destinationAirport: { cityId: parsedBody.destination },
      departureDate: {
        gte: parsedBody.startDate,
        lte: parsedBody.endDate,
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

// controller untuk pencarian penerbangan berdasarkan destinasi favorit
const getFavoriteDestinationController = asyncWrapper(async (req, res) => {
  const { departure, destination, startDate, endDate, minPrice } = req.query;

  // parsing dan validasi input 
  const parsedBody = {
    departure: parseInt(departure),
    destination: parseInt(destination),
    startDate: new Date(startDate),  
    endDate: new Date(endDate),      
    minPrice: parseInt(minPrice),    
  };

  const { error } = favoriteDestinationSchema.validate(parsedBody);
  if (error) {
    const errorMessages = error.details.map((err) => err.message);
    return res.status(400).json({
      status: "error",
      message: errorMessages.join(', '),
    });
  }

  // kriteria pencarian 
  const criteria = {
    where: {
      departureAirport: { cityId: parsedBody.departure },
      destinationAirport: { cityId: parsedBody.destination },
      departureDate: {
        gte: parsedBody.startDate,
        lte: parsedBody.endDate,
      },
      price: {
        gte: parsedBody.minPrice,
      },
    },
    include: {
      airplane: { 
        include: {
          seat: true
        }
      },
      departureAirport: {
        include: {
          city: { // relasi city
            include: {
              country: { // relasi country
                include: {
                  continent: true  // relasi continent
                }
              }
            }
          }
        }
      },
      destinationAirport: {
        include: {
          city: { // relasi city
            include: {
              country: { // relasi country
                include: {
                  continent: true  // relasi continent
                }
              }
            }
          }
        }
      },
      departureTerminal: true,
    },
  };
   

  try {
    const flights = await getFlights(criteria);

    // validasi jika tidak ada penerbangan yang ditemukan
    if (!flights.length) {
      return res.status(404).json({
        status: 'error',
        message: 'Tidak ada penerbangan yang ditemukan',
      });
    }

    // filter penerbangan berdasarkan kursi yang tersedia
    const availableFlights = flights.filter((flight) => {
      const availableSeats = flight.airplane.seat.filter((seat) => seat.status === 'available').length;
      return availableSeats > 0;
    });

    // validasi tiket habis
    if (flights.length > 0 && availableFlights.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Maaf, Tiket terjual habis. Coba cari perjalanan lain.',
      });
    }

    // mengembalikan respons
    return res.status(200).json({
      status: 'success',
      message: 'Penerbangan ditemukan',
      data: convertToJson(availableFlights),
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
  getFavoriteDestinationController
}