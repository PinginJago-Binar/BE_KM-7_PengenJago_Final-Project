import Joi from 'joi';
import asyncWrapper from '../utils/asyncWrapper.js'; 
import convertToJson from "../utils/convertToJson.js"; 
import { getFlights } from '../services/Flight.js';
import { getCities } from '../services/City.js'

// schema validasi menggunakan Joi
const flightSearchSchema = Joi.object({
  departure: Joi.number().required(),
  destination: Joi.number().required(),
  departureDate: Joi.date().required(),
  returnDate: Joi.date().optional(),
  passengers: Joi.number().min(1).required(),
  seatClass: Joi.string().valid('economy', 'business').required(),
});

// controller untuk mengambil data kota
const getCitiesController = asyncWrapper(async (req, res) => {
  const cities = await getCities();
  res.status(200).json({ 
    status: 'success', 
    data: convertToJson(cities) 
  });
});

// controller untuk pencarian penerbangan
const searchFlightController = asyncWrapper(async (req, res) => {
  const { departure, destination, departureDate, returnDate, passengers, seatClass } = req.query;

  // parsing dan validasi input
  const parsedBody = {
    departure: parseInt(departure),
    destination: parseInt(destination),
    departureDate: new Date(departureDate),
    returnDate: returnDate ? new Date(returnDate) : undefined,
    passengers: parseInt(passengers),
    seatClass,
  };

  const { error } = flightSearchSchema.validate(parsedBody);
  if (error) {
    const errorMessages = error.details.map((err) => err.message);
    return res.status(400).json({
      status: "error",
      message: errorMessages.join(', '),
    });
  }

  // validasi jumlah penumpang
  if (parsedBody.passengers > 9) {
    return res.status(400).json({
      status: "error",
      message: 'Maksimum 9 penumpang. (Dewasa dan Anak).',
    });
  }

  try {
    let convertDepartureFlights = [];
    // kriteria pencarian keberangkatan
    const criteria = {
      where: {
        departureAirport: { cityId: parsedBody.departure },
        destinationAirport: { cityId: parsedBody.destination },
        departureDate: {
          gte: new Date(parsedBody.departureDate.setHours(0, 0, 0)),
          lt: new Date(parsedBody.departureDate.setHours(23, 59, 59)),
        },
        class: parsedBody.seatClass || 'economy',
      },
      include: {
        airplane: { include: { seat: true } },
        departureAirport: { include: { city: true } },
        destinationAirport: { include: { city: true } },
        departureTerminal: true,
      },
    };

    // mencari penerbangan keberangkatan
    const departureFlights = await getFlights(criteria);

    // filter penerbangan keberangkatan berdasarkan kursi yang tersedia
    const filterDepartureFlights = departureFlights.filter((flight) => {
      const availableSeats = flight.airplane.seat.filter(seat => seat.status === 'available').length;
      return availableSeats >= parsedBody.passengers;
    });

    convertDepartureFlights = convertToJson(filterDepartureFlights);

    // validasi tiket habis untuk keberangkatan
    if (departureFlights.length > 0 && filterDepartureFlights.length === 0) {
      return res.status(404).json({
        status: "error",
        message: 'Maaf, Tiket terjual habis. Coba cari perjalanan lain.',
      });
    }

    // validasi jika tidak ada data keberangkatan
    if (departureFlights.length === 0) {
      return res.status(404).json({
        status: "error",
        message: 'Maaf, pencarian Anda tidak ditemukan. Coba cari perjalanan lainnya.',
      });
    }

    // pencarian penerbangan kepulangan (jika ada)
    let convertReturnFlights = [];
    if (parsedBody.returnDate) {
      const returnCriteria = {
        where: {
          departureAirport: { cityId: parsedBody.destination },
          destinationAirport: { cityId: parsedBody.departure },
          departureDate: {
            gte: new Date(parsedBody.returnDate.setHours(0, 0, 0)),
            lt: new Date(parsedBody.returnDate.setHours(23, 59, 59)),
          },
          class: parsedBody.seatClass || 'economy',
        },
        include: {
          airplane: { include: { seat: true } },
          departureAirport: { include: { city: true } },
          destinationAirport: { include: { city: true } },
          departureTerminal: true,
        },
      };

      // mencari penerbangan kepulangan
      const returnFlights = await getFlights(returnCriteria);

      // filter penerbangan kepulangan berdasarkan kursi yang tersedia
      const filterReturnFlights = returnFlights.filter((flight) => {
        const availableSeats = flight.airplane.seat.filter(seat => seat.status === 'available').length;
        return availableSeats >= parsedBody.passengers;
      });

      convertReturnFlights = convertToJson(filterReturnFlights);

      // validasi tiket habis untuk kepulangan
      if (returnFlights.length > 0 && filterReturnFlights.length === 0) {
        return res.status(404).json({
          status: "error",
          message: 'Maaf, Tiket terjual habis untuk kepulangan. Coba cari perjalanan lain.',
        });
      }

      // validasi jika tidak ada data penerbangan kepulangan
      if (returnFlights.length === 0) {
        return res.status(404).json({
          status: "error",
          message: 'Maaf, pencarian Anda tidak ditemukan untuk kepulangan. Coba cari perjalanan lainnya.',
        });
      }
    }

    // mengembalikan respons
    return res.status(200).json({
      status: "success",
      message: "Penerbangan ditemukan.",
      data: {
        departureFlights: convertDepartureFlights,
        returnFlights: convertReturnFlights,
      },
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message || 'Terjadi kesalahan saat mencari penerbangan.',
    });
  }
});

export {
  getCitiesController,
  searchFlightController
  }