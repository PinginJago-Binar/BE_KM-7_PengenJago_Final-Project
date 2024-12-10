import { getHistoryAndDetail } from "../services/Transaction.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import { DISCOUNT_FOR_CHILD } from "../config/constants.js";

const getHistoryTransactionAndDetail = asyncWrapper(async (req, res) => {
  
  const { userId } = req.params;

  const transactions = await getHistoryAndDetail(userId);
  
  if (!transactions || transactions.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Anda belum melakukan pemesanan penerbangan.",
    });
  }

  const historyDetailMapping = transactions.map((transaction) => {
    const passengers = transaction.order?.pasengger || [];
    const ordererId= transaction.order?.id || null;
    const amount= Number(transaction.amount);
    const amountAfterTax= Number(transaction.amountAfterTax)
    const priceDetails ={
      passenger: [],
      tax: (amountAfterTax || 0) - (amount || 0),
      totalPayAfterTax: amountAfterTax,
    };

    const groupPassengers = (flight, flightType) => {
      const grouped = {};
      passengers.forEach((passenger) => {
        const type = passenger.passengerType;
        const basePrice = Number(flight?.price || 0);
        let finalPrice = 0;
  
        if (type === "adult") {
          finalPrice = basePrice;
        } else if (type === "child") {
          finalPrice = basePrice * (1 - DISCOUNT_FOR_CHILD);
        } else if (type === "baby") {
          finalPrice = 0;
        }
  
        if (!grouped[type]) {
          grouped[type] = { count: 0, total: 0 };
        }
        grouped[type].count += 1;
        grouped[type].total += finalPrice;
      });
  
      Object.entries(grouped).forEach(([type, details]) => {
        priceDetails.passenger.push({
          type,
          count: details.count,
          total: Number(details.total),
          flightType,
        });
      });
    };

    groupPassengers(transaction.departureFlight, "departure");
    if (transaction.returnFlight) {
      groupPassengers(transaction.returnFlight, "return");
    }

    const ordererNames = passengers.map((passenger) => ({
      id: Number(ordererId),
      fullname: `${passenger.fullname || ""} ${passenger.familyName || ""}`.trim(),  
    }));

    return {
      transactionId: Number(transaction.id),
      departureFlight: {
        status: transaction.status,
        bookingCode: transaction.order?.bookingCode,
        airlineName: transaction.departureFlight?.airplane?.airline?.name,
        airplaneCode: transaction.departureFlight?.airplane?.airplaneCode,
        seatClass: transaction.departureFlight?.class || transaction.returnFlight?.class,
        departure: {
          city: transaction.departureFlight?.departureAirport?.city?.name,
          date: transaction.departureFlight?.departureDate,
          time: transaction.departureFlight?.departureTime,
          airport: transaction.departureFlight?.departureAirport?.name,
          terminalName: transaction.departureFlight?.departureTerminal?.name || "N/A",
        },
        arrival: {
          city: transaction.departureFlight?.destinationAirport?.city?.name,
          date: transaction.departureFlight?.arrivalDate,
          time: transaction.departureFlight?.arrivalTime,
          airport: transaction.departureFlight?.destinationAirport?.name,
        },
      },
      returnFlight: transaction.returnFlight
        ? { 
          status: transaction.status,
          bookingCode: transaction.order?.bookingCode,
          airlineName: transaction.returnFlight?.airplane?.airline?.name,
          airplaneCode:transaction.returnFlight?.airplane?.airplaneCode,
          seatClass: transaction.departureFlight?.class || transaction.returnFlight?.class,
            departure: {
              city: transaction.returnFlight?.departureAirport?.city?.name,
              date: transaction.returnFlight?.departureDate,
              time: transaction.returnFlight?.departureTime,
              airport: transaction.returnFlight?.departureAirport?.name,
              terminalName: transaction.returnFlight?.departureTerminal?.name || "N/A",
            },
            arrival: {
              city: transaction.returnFlight?.destinationAirport?.city?.name,
              date: transaction.returnFlight?.arrivalDate,
              time: transaction.returnFlight?.arrivalTime,
              airport: transaction.returnFlight?.destinationAirport?.name,
            },
          }
        : null,
      priceDetails,
      ordererNames,
    };
  });
  return res.status(200).json({
    success: true,
    data: historyDetailMapping,
  });
});


export {
  getHistoryTransactionAndDetail,
}