import { PrismaClient } from "@prisma/client";
import asyncWrapper from "../utils/asyncWrapper.js"
import convertToJson from "../utils/convertTojson.js";
import Joi from "joi";
import { DISCOUNT_FOR_CHILD, TAX_PAYMENT } from "../config/constants.js";
import { toBoolean } from "../utils/typeDataConvert.js";
import { createOrderer, createPassenger, createTransaction, getAvailableTickets, getDetailFlightById, getFlightById, getPassengerByOrdererId, getSeatByIds, getTransactionById, getTransactionByIdAndUser, groupPassengersByType, markSeatsAsBooked, updatePassengers } from "../services/checkoutServices.js";

const prisma = new PrismaClient();

const getBookingCheckoutDetails = asyncWrapper(async (req, res) => {
  // Parse request parameters
  let { userid: userId, transactionid: transactionId } = req.params;
  userId = parseInt(userId);
  transactionId = parseInt(transactionId);
  
  const transaction = await getTransactionByIdAndUser(transactionId, userId);
  if (!transaction) {
    return res.status(404).json({
      status: 404,
      message: 'Transaction not found!',
    });
  }

  // Destructure and process transaction data
  let { departureFlightId, returnFlightId, ordererId } = transaction;
  departureFlightId = parseInt(departureFlightId);
  returnFlightId = returnFlightId ? parseInt(returnFlightId) : 0;
  ordererId = parseInt(ordererId);

  // Fetch flight details
  const departureFlight = await getDetailFlightById(departureFlightId);
  const returnFlight = returnFlightId ? await getDetailFlightById(returnFlightId) : null;
  const isPP = Boolean(returnFlight);
  
  if (!departureFlight) {
    return res.status(404).json({
      status: 404,
      message: 'Jadwal penerbangan keberangkatan tidak ditemukan',
    });
  }
  if (isPP && !returnFlight) {
    return res.status(404).json({
      status: 404,
      message: 'Jadwal penerbangan pulang tidak ditemukan',
    });
  }

  const departurePrice = parseFloat(departureFlight.price);
  const returnPrice = isPP ? parseFloat(returnFlight.price) : 0;

  // Group passengers by type
  const passengers = await groupPassengersByType(ordererId);

  // Helper function to calculate passenger prices
  const calculatePassengerPrices = (passengerType, count, price, flightType) => {
    let total = 0;
    if (passengerType === 'adult') {
      total = price * count;
    } else if (passengerType === 'child') {
      total = price * (1 - DISCOUNT_FOR_CHILD) * count;
    }

    return { type: passengerType, count, total, flightType };
  };

  // Calculate passenger price details
  const departurePassengerDetails = passengers.map(({ passengerType, _count }) =>
    calculatePassengerPrices(passengerType, _count.passengerType, departurePrice, 'departure')
  );

  const returnPassengerDetails = isPP
    ? passengers.map(({ passengerType, _count }) =>
        calculatePassengerPrices(passengerType, _count.passengerType, returnPrice, 'return')
      )
    : [];

  const passengerDetails = [...departurePassengerDetails, ...returnPassengerDetails];

  // Calculate tax and prepare response
  const tax = parseFloat(transaction.amount) * TAX_PAYMENT;

  return res.status(200).json({
    status: 200,
    message: 'success',
    data: {
      transaction: convertToJson(transaction),
      flights: {
        departure: convertToJson(departureFlight),
        return: convertToJson(returnFlight),
      },
      priceDetails: {
        passenger: passengerDetails,
        tax,
        totalPayBeforeTax: parseFloat(transaction.amount),
        totalPayAfterTax: parseFloat(transaction.amountAfterTax),
      },
    },
  });
});

const validateInitialStoreCheckoutPersonalData = (body) => {
  return Joi.object({
    orderer: Joi.string().required(),
    passengers: Joi.string().required(),
    seatIds: Joi.string().required(),
  }).validate(body, { stripUnknown: true });
}

const validateStoreCheckoutPersonalData = (body) => {
  return Joi.object({
    userId: Joi.number().integer().positive().required(),
    transactionId: Joi.number().integer().positive().required(),
    orderer: Joi.object({
      fullname: Joi.string().min(3).max(120).required(),
      familyName: Joi.string().min(2).max(120).optional(),
      numberPhone: Joi.string().min(10).max(15).required(),
      email: Joi.string().email().required(),
    }),
    passengers: Joi.array().items(
      Joi.object({
        title: Joi.string().valid('mr', 'mrs', 'boy', 'girl').required(),
        passengerType: Joi.string().valid('adult', 'child', 'baby').required(),
        fullname: Joi.string().min(3).max(120).required(),
        familyName: Joi.string().min(2).max(12).optional(),
        birthDate: Joi.date().less('now').required().messages({
          'date.less': 'Tanggal lahir harus di masa lalu.',
        }),
        citizenship: Joi.string().required(),
        identityNumber: Joi.string().min(3).max(25).required(),
        publisherCountry: Joi.string().required(),
        expiredAt: Joi.date().greater('now').required().messages({
          'date.greater': 'Tanggal kedaluwarsa harus di masa depan.',
        }),
      }).custom((passenger, helpers) => {
        if ((passenger.title === 'boy' || passenger.title === 'girl') && passenger.passengerType !== 'child') {
          return helpers.message('Title "boy" atau "girl" hanya cocok dengan tipe "child".');
        } else if ((passenger.title === 'mr' || passenger.title === 'mrs') && passenger.passengerType !== 'adult') {
          return helpers.message('Title "mr" atau "mrs" hanya cocok dengan tipe "adult".');
        }
        return passenger;
      })
    ),
    seatIds: Joi.array().items(Joi.number().positive()).unique().required(),
  }).custom((data, helpers) => {
    if (data.passengers.length !== data.seatIds.length) {
      return helpers.message('Jumlah penumpang dan kursi harus sama.');
    }
    return data;
  }).validate(body);
}

const storeCheckoutPersonalData = asyncWrapper(async (req, res, next) => {

  const { error: initialError } = validateInitialStoreCheckoutPersonalData(req.body);
  if (initialError) return next(initialError);

  const parsedBody = {
    orderer: JSON.parse(req.body.orderer),
    passengers: JSON.parse(req.body.passengers),
    seatIds: JSON.parse(req.body.seatIds),
  };

  const { error: validationError } = validateStoreCheckoutPersonalData({ ...req.body, ...parsedBody });
  if (validationError) return next(validationError);

  let { userId, transactionId, passengers, orderer, seatIds } = { ...req.body, ...parsedBody };
  userId = parseInt(userId);
  transactionId = parseInt(transactionId);

  const transaction = await getTransactionByIdAndUser(transactionId, userId);
  if (!transaction) {
    return res.status(404).json({
      status: 404,
      message: 'Transaction not found!',
    });
  }

  const ordererId = parseInt(transaction.ordererId);

  const updatedOrderer = await prisma.orderer.update({
    where: { id: ordererId },
    data: orderer,
  });

  const passengerData = passengers.map((passenger, index) => ({
    ...passenger,
    birthDate: new Date(passenger.birthDate).toISOString(),
    expiredAt: new Date(passenger.expiredAt).toISOString(),
    seatId: seatIds[index],
  }));

  await updatePassengers(ordererId, passengerData);
  await markSeatsAsBooked(seatIds);

  const updatedPassengers = await getPassengerByOrdererId(ordererId);

  const updatedSeats = await getSeatByIds(seatIds);
  
  return res.status(200).json({
    status: 200,
    message: 'Successfully saved personal data and booked seats.',
    data: {      
      orderer: convertToJson(updatedOrderer),
      passengers: convertToJson(updatedPassengers),
      seats: convertToJson(updatedSeats),
    },
  });
});



const validateInitialRequest = (body) => {
  const schema = Joi.object({
    passengers: Joi.string().required(),
    flightIds: Joi.string().required(),
  });
  return schema.validate(body, { stripUnknown: true });
};

const validateBookingData = (body) => {
  const schema = Joi.object({
    passengers: Joi.object({
      adult: Joi.number().integer().min(0).required(),
      child: Joi.number().integer().min(0).required(),
      baby: Joi.number().integer().min(0).required(),
    }).required(),
    userId: Joi.number().integer().positive().required(),
    flightIds: Joi.object({
      departure: Joi.number().integer().positive().required(),
      return: Joi.number().integer().required(),
    }).required(),
    pp: Joi.boolean().required().default(false),
  });
  return schema.validate(body);
};

// Helper Functions
const calculateTotalPay = (pp, passenger, prices) => {
  return Object.entries(passenger).reduce((totalPay, [type, count]) => {
    let pricePerPerson = 0;

    if (type === 'adult') {
      pricePerPerson = prices.departure + (pp ? prices.return : 0);
    } else if (type === 'child') {
      const discount = DISCOUNT_FOR_CHILD;
      pricePerPerson =
        prices.departure * (1 - discount) + (pp ? prices.return * (1 - discount) : 0);
    }

    return totalPay + pricePerPerson * count;
  }, 0);
};

const createBookingCheckout = asyncWrapper(async (req, res, next) => {
  // Validate Initial Request
  const { error: initialValidationError } = validateInitialRequest(req.body);
  if (initialValidationError) return next(initialValidationError);

  req.body.passengers = JSON.parse(req.body.passengers);
  req.body.flightIds = JSON.parse(req.body.flightIds);

  // Validate Booking Data
  const { error: dataValidationError } = validateBookingData(req.body);
  if (dataValidationError) return next(dataValidationError);

  const { passengers, userId: rawUserId, flightIds, pp: rawPp } = req.body;
  const pp = toBoolean(rawPp);
  const userId = parseInt(rawUserId);

  const { departure: departureFlightId, return: returnFlightId } = flightIds;

  // Fetch Flights
  const departureFlight = await getFlightById(departureFlightId);
  const returnFlight = pp ? await getFlightById(returnFlightId) : null;

  if (!departureFlight) {
    return res.status(404).json({
      status: 404,
      message: 'Jadwal penerbangan keberangkatan tidak ditemukan',
    });
  }
  if (pp && !returnFlight) {
    return res.status(404).json({
      status: 404,
      message: 'Jadwal penerbangan pulang tidak ditemukan',
    });
  }

  const departureTickets = await getAvailableTickets(departureFlight.airplaneId);
  const returnTickets = pp ? await getAvailableTickets(returnFlight.airplaneId) : 0;
  const passengerCount = passengers.adult + passengers.child;

  if (passengerCount > departureTickets) {
    return res.status(400).json({
      status: 400,
      message: `Mohon maaf, tiket sudah habis untuk ${passengerCount} penumpang pada tiket keberangkatan Anda. Tersisa ${departureTickets} tiket saja.`,
    });
  }

  if (pp && passengerCount > returnTickets) {
    return res.status(400).json({
      status: 400,
      message: `Mohon maaf, tiket sudah habis untuk ${passengerCount} penumpang pada tiket kepulangan Anda. Tersisa ${returnTickets} tiket saja.`,
    });
  }


  // Create Orderer
  const createdOrderer = await createOrderer();

  // Calculate Payment
  const prices = {
    departure: parseFloat(departureFlight.price),
    return: pp ? parseFloat(returnFlight.price) : 0,
  };

  const totalPay = calculateTotalPay(pp, passengers, prices);
  const totalPayWithTax = totalPay + totalPay * TAX_PAYMENT;

  // Prepare Passenger Data
  const passengerArray = Object.entries(passengers).flatMap(([type, count]) =>
    Array.from({ length: count }, () => ({
      orderedId: createdOrderer.id,
      passengerType: type,
    }))
  );

  // Save many passenger
  await createPassenger(true, passengerArray);

  const deadline = new Date();
  deadline.setMinutes(deadline.getMinutes() + 15);

  const transactionData = {
    userId,
    ordererId: createdOrderer.id,
    departureFlightId,
    returnFlightId: pp ? returnFlightId : null,
    status: 'unpaid',
    amount: totalPay,
    amountAfterTax: totalPayWithTax,
    expiredFilling: deadline.toISOString(),
  };

  const createdTransaction = await createTransaction(transactionData);

  return res.status(200).json({
    status: 200,
    message: 'success create booking ticket for checkout',
    data: {
      transaction: convertToJson(createdTransaction)
    }
  });
});


export { 
  getBookingCheckoutDetails,
  createBookingCheckout,
  storeCheckoutPersonalData
}