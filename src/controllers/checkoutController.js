import { DISCOUNT_FOR_CHILD, TAX_PAYMENT } from "../config/constants.js";
import asyncWrapper from "../utils/asyncWrapper.js"
import convertToJson from "../utils/convertToJson.js";
import { toBoolean } from "../utils/typeDataConvert.js";
import { generateRandomString } from "../utils/stringHelper.js";
import Midtrans from "midtrans-client";
import { createEmptyOrderer, getOrdererByBookingCode, getOrdererById, updateOrdererById } from "../services/Orderer.js";
import { createTransaction, getTransactionByIdAndUser, getTransactionByOrdererId, updateTransactionById } from "../services/Transaction.js";
import { getAvailableTickets, markSeatsAsBooked, getSeatByIds, markSeatsAsAvailable } from "../services/Seat.js";
import { getDetailFlightById, getFlightById } from "../services/Flight.js";
import { createPassenger, getPassengerByOrdererId,getPassengerByOrdererIdWithFilter,groupPassengersByType, updatePassengers } from "../services/Passenger.js";
import { validateBookingData, validateCheckoutPaymentData, validateInitialRequest, validateInitialStoreCheckoutPersonalData, validateStoreCheckoutPersonalData } from "../middlewares/validations/checkoutValidations.js";
import { createPaymentDetail, getPaymentDetailByTransactionId } from "../services/Payment.js";


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
  const isPP = Boolean(returnFlightId);
  
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


  const prices = {
    departure : parseFloat(departureFlight.price),
    return : isPP ? parseFloat(returnFlight.price) : 0,
  }

  // Calculate passenger price details
  const passengerDetails = await calculatePassengerDetails(ordererId, prices);

  // Calculate tax and prepare response
  const tax = parseFloat(transaction.amount) * TAX_PAYMENT;

  const passengerData = await getPassengerByOrdererId(ordererId);  
  const ordererData = await getOrdererById(ordererId);

  return res.status(200).json({
    status: 200,
    message: 'success',
    data: {
      transaction: convertToJson(transaction),
      passengers: convertToJson(passengerData),
      orderer: convertToJson(ordererData),
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

  const expiredFilling = new Date(transaction.expiredFilling);
  const now = new Date();
  if (now > expiredFilling) {
    return res.status(410).json({
      status: 410,
      message: "Waktu anda mengisi data sudah habis, transaksi ini dibatalkan. Lakukan transaksi kembali!"
    });
  }

  const ordererId = parseInt(transaction.ordererId);
  const emptyPassengers = await getPassengerByOrdererIdWithFilter(ordererId, { passengerType: { not: "baby" } });  
 
  const updatedOrderer = await updateOrdererById(ordererId, orderer);
  
  let passengerData = passengers.map((passenger, index) => ({    
    ...passenger,
    id: emptyPassengers[index].id,
    flightType: "departure",
    birthDate: new Date(passenger.birthDate).toISOString(),
    expiredAt: new Date(passenger.expiredAt).toISOString(),
    seatId: seatIds[index],
  }));

  if (transaction.returnFlightId != null) {
    let passengerReturn = passengers.map((passenger, index) => ({
      ...passenger,
      id: emptyPassengers[emptyPassengers.length / 2 + index].id,
      flightType: "return",
      birthDate: new Date(passenger.birthDate).toISOString(),
      expiredAt: new Date(passenger.expiredAt).toISOString(),
      seatId: seatIds[emptyPassengers.length - (index + 1)],
    }));

    passengerData = [...passengerData, ...passengerReturn]
  }  

  await updatePassengers(ordererId, passengerData);
  await markSeatsAsBooked(seatIds);

  const updatedPassengers = await getPassengerByOrdererId(ordererId);

  const updatedSeats = await getSeatByIds(seatIds);
  
  return res.status(200).json({
    status: 200,
    message: 'Successfully saved personal data and booked seats.',
    data: { 
      transaction: convertToJson(transaction),     
      orderer: convertToJson(updatedOrderer),
      passengers: convertToJson(updatedPassengers),
      seats: convertToJson(updatedSeats),
    },
  });
});

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
  console.log(req.body)
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
  const createdOrderer = await createEmptyOrderer();

  // Calculate Payment
  const prices = {
    departure: parseFloat(departureFlight.price),
    return: pp ? parseFloat(returnFlight.price) : 0,
  };

  const totalPay = calculateTotalPay(pp, passengers, prices);
  const totalPayWithTax = totalPay + totalPay * TAX_PAYMENT;

  // Prepare Passenger Data
  let passengerArray = [];
  let passengerDeparture = Object.entries(passengers).flatMap(([type, count]) =>
    Array.from({ length: count }, () => ({
      orderedId: createdOrderer.id,
      passengerType: type,
      flightType: "departure"      
    }))
  );

  let passengerReturn = [];
  if (pp && returnFlight) {
    passengerReturn = Object.entries(passengers).flatMap(([type, count]) =>
      Array.from({ length: count }, () => ({
        orderedId: createdOrderer.id,
        passengerType: type,
        flightType: "return"
      }))
    );    

  }

  passengerArray = [...passengerDeparture, ...passengerReturn];

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

const processPayment = asyncWrapper(async (req, res, next) => {
  // Validasi input data
  const { error: validationError } = validateCheckoutPaymentData(req.body);
  if (validationError) return next(validationError);

  const { transactionId: rawTransactionId, userId: rawUserId } = req.body;
  const transactionId = parseInt(rawTransactionId);
  const userId = parseInt(rawUserId);

  // Ambil transaksi berdasarkan ID dan User ID
  const transaction = await getTransactionByIdAndUser(transactionId, userId);
  if (!transaction) {
    return res.status(404).json({ status: 404, message: 'Transaksi tidak ditemukan!' });
  }

  if (transaction.snapToken !== null) {
    return res.status(401).json({ status: 401, message: 'Anda sudah pernah membuat pembayaran pada transaksi ini. Cek pada halaman history transaksi untuk melanjutkan pembayaran' });
  }

  if (transaction.status === "issued") {
    return res.status(401).json({ status: 401, message: 'Anda sudah melakukan pembayaran' });
  }
  
  
  const departureFlightId = parseInt(transaction.departureFlightId);
  const returnFlightId = transaction.returnFlightId ? parseInt(transaction.returnFlightId) : 0;
  const isRoundTrip = returnFlightId > 0;

  const departureFlight = await getDetailFlightById(departureFlightId);
  const returnFlight = isRoundTrip ? await getDetailFlightById(returnFlightId) : null;

  if (!departureFlight) {
    return res.status(404).json({ status: 404, message: 'Jadwal penerbangan keberangkatan tidak ditemukan' });
  }

  if (isRoundTrip && !returnFlight) {
    return res.status(404).json({ status: 404, message: 'Jadwal penerbangan pulang tidak ditemukan' });
  }

  const prices = {
    departure: parseFloat(departureFlight.price),
    return: isRoundTrip ? parseFloat(returnFlight.price) : 0
  };

  const ordererId = parseInt(transaction.ordererId);
  const passengers = await getPassengerByOrdererId(ordererId);
  

  const passengerDetails = await calculatePassengerDetails(ordererId, prices);  

  const tax = parseInt(transaction.amount * TAX_PAYMENT);
  
  let itemDetails = generateItemDetails(passengers, prices);
  let taxDetail = {
    id: `${ordererId}${generateRandomString(4)}`,
    name: "Tax",
    quantity: 1,
    price: tax,    
  };
  itemDetails = [...itemDetails, taxDetail];  

  const bookingCode = `BOOK-${userId}${ordererId}${generateRandomString(5)}`;
  const ordererUpdated = await updateOrdererById(ordererId, { bookingCode });

  //  Midtrans Configuration
  const snap = new Midtrans.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
  });

  const parameters = {
    transaction_details: { 
      order_id: bookingCode,
      gross_amount: parseInt(transaction.amountAfterTax)
    },
    credit_card: { secure: true },
    item_details: convertToJson(itemDetails),
    customer_details: {
      first_name: ordererUpdated.fullname,
      email: ordererUpdated.email,
      phone: ordererUpdated.numberPhone,
    },
  };
  
  const midtransTransaction = await snap.createTransaction(parameters);

  const snapToken = midtransTransaction.token;

  const now = new Date();
  let expiredPayment = new Date(now);  
  expiredPayment.setMinutes(expiredPayment.getMinutes() + 15);

  const updatedTransaction = await updateTransactionById(transactionId, { 
    snapToken,
    expiredPayment: expiredPayment.toISOString(),
    updatedAt: now.toISOString()    
  });

  // Kirim respons sukses
  return res.status(200).json({
    status: 200,
    message: 'Success create payment',
    data: {      
      snapToken: snapToken,      
      redirectUrl: midtransTransaction.redirect_url,
      transaction: convertToJson(updatedTransaction),      
      orderer: convertToJson(ordererUpdated),
      flights: {
        departure: convertToJson(departureFlight),
        return: convertToJson(returnFlight),
      },
      priceDetails: {
        passenger: convertToJson(passengerDetails),
        tax,
        totalPayBeforeTax: parseFloat(transaction.amount),
        totalPayAfterTax: parseFloat(transaction.amountAfterTax),
      },
    },
  });
});

// Fungsi bantu untuk menghitung detail harga penumpang
const calculatePassengerDetails = async (ordererId, prices) => {  
    // Group passengers by type
    const passengers = await groupPassengersByType(ordererId);    
    
    // Helper function to calculate passenger prices
    const calculatePassengerPrices = (passengerType, count, prices, flightType) => {
      const price = flightType === "departure" ? prices.departure : prices.return;
      let total = 0;
      
      if (passengerType === 'adult') {
        total = price * count;
      } else if (passengerType === 'child') {
        total = price * (1 - DISCOUNT_FOR_CHILD) * count;
      }
  
      return { type: passengerType, count, total, flightType };
    };
  
    // Calculate passenger price details
    const passengerDetails = passengers.map(({ passengerType, _count, flightType }) =>
      calculatePassengerPrices(passengerType, _count.passengerType, prices, flightType)
    );  

  return passengerDetails;
}

const generateItemDetails = (passengers, prices) => {

  const createItem = (passenger, prices) => {
    const flightType = passenger.flightType;
    const price = flightType === "departure" ? prices.departure : prices.return;
 
    const calculatePrice = (type, count, price) => {
      if (type === 'adult') {
        return price * count;      
      } else if (type === 'child') {
        return price * (1 - DISCOUNT_FOR_CHILD) * count;
      } else {
        return 0;
      }    
    };    

    return {
      id: passenger.id,
      name: passenger.fullname ?? 'baby',
      quantity: 1,
      price: calculatePrice(passenger.passengerType, 1, price),
      category: `${flightType} flight`,
    }
  };

  const items = passengers.map((passenger) => createItem(passenger, prices));

  return items;
}

const paymentNotif = asyncWrapper(async (req, res, next) => {
  const { 
    order_id: bookingCode,
    transaction_id: midtransTransactionId,
    transaction_status: midtransTransactionStatus,
    fraud_status: fraudStatus,
    payment_type: paymentType,
    expiry_time: expiryTime
  } = req.body; 

  const orderer = await getOrdererByBookingCode(bookingCode);
  if (!orderer) {
    return res.status(404).json({ message: "Orderer not found" });
  }

  const transaction = await getTransactionByOrdererId(orderer.id);
  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }  

  const transactionId = parseInt(transaction.id);

  const generateStatus = (midtransStatus) => {
    switch (midtransStatus) {
      case "capture":
      case "settlement":
        return "issued";
      case "pending":
        return "unpaid";
      case "cancel":
      case "deny":
      case "expire":
        return "cancelled";
      default:
        return "cancelled";
    }
  };
  
  const handlePaymentUpdate = async (status) => {
    await updateTransactionById(transactionId, { status });

    const payment = await getPaymentDetailByTransactionId(transactionId);
    if (!payment) {
      const paymentData = { transactionId, paymentType };
      await createPaymentDetail(paymentData);
    }
  };
  

  const currentTime = new Date();
  const expiryTimeObj = new Date(expiryTime);

  if (transaction.status !== "issued" && currentTime > expiryTimeObj) {    
    await handlePaymentUpdate("cancelled");

    const passengers = await getPassengerByOrdererId(orderer.id);
    const seatIds = passengers.map(passenger => parseInt(passenger.seatId));
    await markSeatsAsAvailable(seatIds);

    return res.status(200).json({ message: "Transaction expired. Status updated to 'cancelled'." });
  }

  if (transaction.status !== "cancelled") {
    try {
      switch (midtransTransactionStatus) {
        case "capture":
          if (fraudStatus === "accept") {
            await handlePaymentUpdate(generateStatus(midtransTransactionStatus));
          }
          break;

        case "settlement":
          await handlePaymentUpdate(generateStatus(midtransTransactionStatus));
          break;

        case "cancel":
        case "deny":
        case "expire": {
                      
          const passengers = await getPassengerByOrdererId(orderer.id);          

          const seatIds = passengers.map(passenger => parseInt(passenger.seatId));

          await Promise.all([
            handlePaymentUpdate(generateStatus(midtransTransactionStatus)),
            markSeatsAsAvailable(seatIds),
          ]);

          break;
        }

        case "pending":
          await updateTransactionById(transactionId, {
            status: generateStatus(midtransTransactionStatus),
          });
          break;

        default:
          console.warn("Unhandled transaction status:", midtransTransactionStatus);
          break;
      }

      console.log("Payment notification processed successfully");      
    } catch (error) {
      console.error("Error processing notification:", error);      
    }

  }
  
  return res.status(200).json({ message: "Notification processed successfully" });
});






export { 
  getBookingCheckoutDetails,
  createBookingCheckout,
  storeCheckoutPersonalData,
  processPayment,
  paymentNotif
}