import { getHistoryAndDetail, groupPassengersByType } from "../services/Transaction.js";
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
  
  const historyDetailMapping = await Promise.all(transactions.map(async (transaction) => {
    
    const orderedId= transaction.order?.id || null;
    const amount= Number(transaction.amount);
    const amountAfterTax= Number(transaction.amountAfterTax)
    
    const calculatePassengerDetails = async (orderedId, prices) => {
      // Group passengers by type
      const passengers = await groupPassengersByType(orderedId);    
      
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
    };
    
    const priceDetails ={
      passenger: [],
      tax: (amountAfterTax || 0) - (amount || 0),
      totalPayAfterTax: amountAfterTax,
    };

    const prices = {
      departure: Number(transaction.departureFlight?.price || 0),
      return: Number(transaction.returnFlight?.price || 0),
    };
    
    const passengerDetails = await calculatePassengerDetails(orderedId, prices);
    priceDetails.passenger = passengerDetails;
    
    const ordererNames = [];
    
    transaction.order?.pasengger?.forEach((passenger) => {
      const fullname = `${passenger.fullname || ""} ${passenger.familyName || ""}`.trim();
      
      // Periksa apakah nama sudah ada di dalam ordererNames
      if (!ordererNames.some((entry) => entry.fullname === fullname)) {
        ordererNames.push({
          id: Number(orderedId),
          fullname,
        });
      }
    });
    return {
      transactionId: Number(transaction.id),
      departureFlight: {
        status: transaction.status,
        bookingCode: transaction.order?.bookingCode,
        airlineName: transaction.departureFlight?.airplane?.airline?.name,
        airplaneCode: transaction.departureFlight?.airplane?.airplaneCode,
        seatClass: transaction.departureFlight?.class || transaction.returnFlight?.class,
        logo: transaction.departureFlight?.airplane?.airline?.logo,
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
          logo: transaction.returnFlight?.airplane?.airline?.logo,
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
  }));
  return res.status(200).json({
    success: true,
    data: historyDetailMapping,
  });
  
});
export {
  getHistoryTransactionAndDetail,
}