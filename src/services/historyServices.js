import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getHistory(email) {
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
          pasengger : {
            select : {
              seat : {
                select: {
                  class: true,
                },
              },
            },
          },
        },
      },
      flight: {
        select: {
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

  const historyMaping = transactions.map((transaction) => ({
    transactionId: Number(transaction.id), // Konversi BigInt ke number
    status: transaction.status,
    bookingCode: transaction.order?.bookingCode,
    seatClass: transaction.order?.pasengger?.[0].seat?.class || "N/A",
    flight: {
      departure: {
        date: transaction.flight?.departureDate,
        time: transaction.flight?.departureTime,
        airport: transaction.flight?.departureAirport?.name,
      },
      arrival: {
        date: transaction.flight?.arrivalDate,
        time: transaction.flight?.arrivalTime,
        airport: transaction.flight?.destinationAirport?.name,
      },
    },
  }));
  return {
    success: true,
    data: historyMaping,
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
                    seat: {
                        select: {
                            class: true,
                        },
                    },
                },
            },
        },
      },
      flight: {
        select: {
          departureDate: true,
          departureTime: true,
          arrivalDate: true,
          arrivalTime: true,
          departureTerminal: {
            select: {
                name: true,
            },
          },
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
        },
      },
    },
  });
  const historyDetailMaping = transactions.map((transaction) => ({
    status: transaction.status,
    bookingCode: transaction.order?.bookingCode,
    seatClass: transaction.order?.pasengger?.[0].seat?.class || "N/A",
    flight: {
      departure: {
        date: transaction.flight?.departureDate,
        time: transaction.flight?.departureTime,
        airport: transaction.flight?.departureAirport?.name,
        terminalName: transaction.flight?.departureTerminal?.name || "N/A",
      },
      arrival: {
        date: transaction.flight?.arrivalDate,
        time: transaction.flight?.arrivalTime,
        airport: transaction.flight?.destinationAirport?.name,
      },
    },
    airplaneCode: transaction.flight?.airplane?.airplaneCode,
    airlineName: transaction.flight?.airplane?.airline.name,
    named: transaction.order?.fullname,
    nameded: transaction.order?.familyName,
    ordererId: transaction.order?.id.toString(),
    amount: transaction.amount,
    amountAfterTax: transaction.amountAfterTax,
    passengerType: transaction.order?.pasengger?.[0].passengerType || "N/A",
  }));
  return {
    success: true,
    data: historyDetailMaping,
  };
};