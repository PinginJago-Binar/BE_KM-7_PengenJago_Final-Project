import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

export async function getHistory(email) {

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user){
    throw new Error ('User not found');
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      // NOT: { returnFlightId: null },
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
    Data: historyMapping,
  };
};

export async function historyDetail(transactionId) {
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
            fullname: true,
            familyName: true,
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
    const pasenggers = transaction.order?.pasengger || [];
    const totalPassengers = pasenggers.length;

    return {
      status: transaction.status,
      bookingCode: transaction.order?.bookingCode,
      status: transaction.status,
      seatClass: transaction.departureFlight?.class || transaction.returnFlight?.class,
      departureFlight: {
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
      } : null,
      airplaneCode: transaction.flight?.airplane?.airplaneCode,
      airlineName: transaction.flight?.airplane?.airline.name,
      amount: transaction.amount,
      amountAfterTax: transaction.amountAfterTax,
      totalPassengers,
      pasenggerDetails: pasenggers.map((pasengger) => ({
        fullNameAndFamily: `${transaction.order?.fullname} ${transaction.order?.familyName}`.trim(),
        passengerType: pasengger.passengerType,
        ordererId: transaction.order?.id.toString(),
        seatClass: transaction.departureFlight?.class || transaction.returnFlight?.class,
      })),
    };
  });
  return {
    success: true,
    data: historyDetailMapping,
  };
};