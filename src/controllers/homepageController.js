import Joi from 'joi';
import { searchFlightService, checkTicketService } from '../services/Flight.js';
import asyncWrapper from '../utils/asyncWrapper.js';

export const getHomepage = (req, res) => {
  const homepageView = {
    message: "Selamat datang di Beranda Utama",
  };
  res.status(200).json(homepageView);
};


// skema validasi dengan Joi
const flightSearchSchema = Joi.object({
  departure: Joi.number().required(),
  destination: Joi.number().required(),
  departureDate: Joi.date().required(),
  returnDate: Joi.date().iso().optional(),
  passengers: Joi.number().min(1).required(),
  seatClass: Joi.string().valid('economy', 'business').required(),
});


export const searchFlightControll = asyncWrapper(async (req, res) => {
  const { departure, destination, departureDate, returnDate, passengers, seatClass } = req.body;


  try {
    console.log("Request body:", req.body);


    // validasi input menggunakan Joi
    const { error } = flightSearchSchema.validate({
      departure,
      destination,
      departureDate,
      returnDate,
      passengers,
      seatClass,
    });


    if (error) {
      const errorMessages = error.details.map((err) => err.message);
      return res.status(400).json({ message: errorMessages.join(", ") });
    }


    // konversi tanggal keberangkatan ke UTC+7 (WIB)
    const departureDateConverted = new Date(departureDate);
    departureDateConverted.setHours(departureDateConverted.getHours() + 7);

    // konversi tanggal kepulangan ke UTC+7 (WIB)
    const returnDateConverted = returnDate
      ? (() => {
          const date = new Date(returnDate);
          date.setHours(date.getHours() + 7);
          return date;
        })()
      : null;


    // memanggil service untuk mencari penerbangan
    const { departureFlights, returnFlights } = await searchFlightService({
      departure,
      destination,
      departureDate: departureDateConverted,
      returnDate: returnDateConverted,
      passengers,
      seatClass,
    });


    // jika returnDate diisi, maka harus ada kedua jadwal (departure & return)
    if (returnDate && (departureFlights.length === 0 || returnFlights.length === 0)) {
      console.log("Tidak ada penerbangan untuk salah satu jadwal (departure atau return)");
      return res.status(404).json({
        message: "Maaf, pencarian anda tidak ditemukan. Pastikan kedua jadwal tersedia.",
      });
    }


    // jika hanya departureFlights yang tersedia (tanpa returnDate), maka kedua penerbangan dibuat tidak ada
    if (departureFlights.length === 0) {
      console.log("Tidak ada penerbangan keberangkatan ditemukan");
      return res.status(404).json({
        message: "Maaf, pencarian anda tidak ditemukan. Coba cari perjalanan lainnya.",
      });
    }


    // mengirim respons dengan data penerbangan departure dan return
    res.status(200).json({
      departureFlights: departureFlights.map((flight) => ({
        ...flight,
        id: flight.id.toString(),
        airplaneId: flight.airplaneId.toString(),
        departureAirportId: flight.departureAirportId.toString(),
        destinationAirportId: flight.destinationAirportId.toString(),
        departureTerminalId: flight.departureTerminalId?.toString() || null,
      })),
      returnFlights: returnFlights.map((flight) => ({
        ...flight,
        id: flight.id.toString(),
        airplaneId: flight.airplaneId.toString(),
        departureAirportId: flight.departureAirportId.toString(),
        destinationAirportId: flight.destinationAirportId.toString(),
        departureTerminalId: flight.departureTerminalId?.toString() || null,
      })),
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || 'Terjadi kesalahan saat mencari penerbangan',
    });
  }
});

export const ticketControll = asyncWrapper(async (req, res) => {
  const { flightId, returnFlightId } = req.params; 

  try {
    // mengecek ketersediaan tiket keberangkatan dan kepulangan
    const { departureSeats, returnSeats } = await checkTicketService(flightId, returnFlightId);

    // jika tiket keberangkatan habis
    if (departureSeats <= 0) {
      return res.status(400).json({
        message: 'Tiket untuk penerbangan keberangkatan ini habis. Silahkan pilih penerbangan lain.',
      });
    }

    // jika tiket kepulangan habis (dengan return Date)
    if (returnFlightId && returnSeats <= 0) {
      return res.status(400).json({
        message: 'Tiket untuk penerbangan kepulangan ini habis. Silahkan pilih penerbangan lain.',
      });
    }

    // mengecek apakah user sudah login
    // tiket tersedia dan user belum login
    if (!req.isAuthenticated) {
      return res.status(401).json({
        message: 'Tiket tersedia, Anda harus login untuk melanjutkan ke checkout.',
      });
    }

    // tiket tersedia dan user sudah login
    return res.status(200).json({
      message: 'Tiket tersedia, silahkan lanjutkan ke proses checkout.',
      availableSeats: {
        departureSeats,
        returnSeats: returnFlightId ? returnSeats : null,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || 'Terjadi kesalahan saat memeriksa ketersediaan tiket.',
    });
  }
});
