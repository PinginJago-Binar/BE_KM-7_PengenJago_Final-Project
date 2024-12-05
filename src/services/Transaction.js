import { DISCOUNT_FOR_CHILD } from "../config/constants.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


const createTransaction = async (data) => {
  return prisma.transaction.create({ data });
}

/**
 * Get transaction by user id
 * @param {number} transactionId 
 */
const getTransactionById = async (transactionId) => {
  return prisma.transaction.findUnique({ 
    where: { id: transactionId } }
  );
}

/**
 * Get transaction by transaction id and user id
 * @param {number} transactionId 
 * @param {number} userId 
 * @returns 
 */
const getTransactionByIdAndUser = async (transactionId, userId) => {
  return prisma.transaction.findUnique({
    where: {    
      id: transactionId,
      userId: userId,      
    },
  });
};

const getHistory = async (email) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      user: {
        email: email,
      },
    },
    select: {
      id: true,
      status: true,
      amountAfterTax: true,
      ordererId: true,
      order: {
        select: {
          bookingCode: true,
        },
      },
      departureFlight: {
        select: {
          class: true,
          departureDate: true,
          departureTime: true,
          arrivalDate: true,
          arrivalTime: true,
          departureAirport: {
            select: {
              name: true,
            },
          },
          destinationAirport: {
            select: {
              name: true,
            },
          },
        },
      },
      returnFlight: {
        select: {
          class: true,
          departureDate: true,
          departureTime: true,
          arrivalDate: true,
          arrivalTime: true,
          departureAirport: {
            select: {
              name: true,
            },
          },
          destinationAirport: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!transactions || transactions.length === 0) {
    return {
      success: false,
      message: "Anda belum melakukan pemesanan penerbangan.",
    };
  }

  const historyMapping = transactions.map((transaction) => ({
    transactionId: Number(transaction.id), // Konversi BigInt ke number
    departureflight: {
      status: transaction.status,
      bookingCode: transaction.order?.bookingCode,
      amountAfterTax: transaction.amountAfterTax,
      seatClass: transaction.departureFlight?.class || transaction.returnFlight?.class,
      departure: {
        date: transaction.departureFlight?.departureDate,
        time: transaction.departureFlight?.departureTime,
        airport: transaction.departureFlight?.departureAirport?.name,
      },
      arrival: {
        date: transaction.departureFlight?.arrivalDate,
        time: transaction.departureFlight?.arrivalTime,
        airport: transaction.departureFlight?.destinationAirport?.name,
      },
    },
    returnFlight: transaction.returnFlight
  ? {
      status: transaction.status,
      bookingCode: transaction.order?.bookingCode,
      amountAfterTax: transaction.amountAfterTax,
      seatClass: transaction.departureFlight?.class || transaction.returnFlight?.class,
      departure: {
        date: transaction.returnFlight.departureDate,
        time: transaction.returnFlight.departureTime,
        airport: transaction.returnFlight.departureAirport?.name,
      },
      arrival: {
        date: transaction.returnFlight.arrivalDate,
        time: transaction.returnFlight.arrivalTime,
        airport: transaction.returnFlight.destinationAirport?.name,
      },
    }
  : null,

    
  }));
  return {
    success: true,
    data: historyMapping,
  };
};

const historyDetail = async (transactionId) => {
  const transactions = await prisma.transaction.findMany({
    where: {
        id: transactionId,
    },
    select: {
      status: true,
      amount: true,
      amountAfterTax: true,
      
      order : {
        select: {
            id: true,
            bookingCode: true,
            pasengger: {
                select: {
                    passengerType: true,
                    fullname: true,
                    familyName: true,
                },
            },
        },
      },
      departureFlight: {        
        select: {
          airplane: {
            select: {
              airplaneCode: true,
              airline: {
                select: {
                  name: true,
                },
              },
            },
          },
          price: true,
          class: true,
          departureTerminal: {
            select: { 
              name: true, 
            },
          },
          departureDate: true,
          departureTime: true,
          arrivalDate: true,
          arrivalTime: true,
          departureAirport: {
            select: {
              name: true,
            },
          },
          destinationAirport: {
            select: {
              name: true,
            },
          },
        },
      },
      returnFlight: {
        select: {
          airplane: {
            select: {
              airplaneCode: true,
              airline: {
                select: {
                  name: true,
                },
              },
            },
          },
          price: true,
          departureTerminal: {
            select: {
              name: true,
            },
          },
          class: true,
          departureDate: true,
          departureTime: true,
          arrivalDate: true,
          arrivalTime: true,
          departureAirport: {
            select: {
              name: true,
            },
          },
          destinationAirport: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!transactions || transactions.length === 0) {
    return {
      success: false,
      message: "Anda belum melakukan pemesanan penerbangan.",
    };
  }
  

  const historyDetailMapping = transactions.map((transaction) => {
    const passengers = transaction.order?.pasengger || [];
    const ordererId= transaction.order?.id || null;
    const priceDetails = {
      passenger: [],
      tax: transaction.amountAfterTax - transaction.amount,
      totalPayAfterTax: transaction.amountAfterTax,
    };

    const groupPassengers = (flight, flightType) => {
      const grouped = {};
      passengers.forEach((passenger) => {
        const type = passenger.passengerType;
        const basePrice = flight?.price || 0;
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
          total: details.total,
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
      departureFlight: {
        status: transaction.status,
        bookingCode: transaction.order?.bookingCode,
        airlineName: transaction.departureFlight?.airplane?.airline?.name,
        airplaneCode: transaction.departureFlight?.airplane?.airplaneCode,
        seatClass: transaction.departureFlight?.class || transaction.returnFlight?.class,
        departure: {
          date: transaction.departureFlight?.departureDate,
          time: transaction.departureFlight?.departureTime,
          airport: transaction.departureFlight?.departureAirport?.name,
          terminalName: transaction.departureFlight?.departureTerminal?.name || "N/A",
        },
        arrival: {
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
              date: transaction.returnFlight?.departureDate,
              time: transaction.returnFlight?.departureTime,
              airport: transaction.returnFlight?.departureAirport?.name,
              terminalName: transaction.returnFlight?.departureTerminal?.name || "N/A",
            },
            arrival: {
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
  return {
    success: true,
    data: historyDetailMapping,
  };
};



export {
  createTransaction,
  getTransactionById,
  getTransactionByIdAndUser,
  getHistory,
  historyDetail
}