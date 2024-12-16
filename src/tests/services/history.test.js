import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { getHistoryAndDetail } from "../../services/Transaction.js";


vi.mock('@prisma/client', () => {
    const mockPrismaClient = {
        transaction : {
            findMany: vi.fn(),
        },
    };
    return { PrismaClient: vi.fn(() => mockPrismaClient) };
});

const prisma = new PrismaClient()

describe("getHistoryAndDetail", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Mengembalikan riwayat history sesuai userId dengan status 200", async () => {
        const mockUserId = 1
        const mockData = [
            {
                id: 1,
                status: 'success',
                amount: 1000,
                amountAfterTax: 900,
                order: {
                    id: 10,
                    bookingCode: 'ABC123',
                    pasengger: [
                        {
                            passengerType: 'adult',
                            fullname: 'John Doe',
                            familyName: 'Doe',
                        },
                    ],
                },
                departureFlight: {
                    airplane: {
                        airplaneCode: 'A320',
                        airline: { name: 'Airline 1', logo: 'logo.png' },
                    },
                    price: 500,
                    class: 'Economy',
                    departureTerminal: { name: 'Terminal 1' },
                    departureDate: '2024-12-10',
                    departureTime: '10:00',
                    arrivalDate: '2024-12-10',
                    arrivalTime: '14:00',
                    departureAirport: {
                        name: 'Airport A',
                        city: { name: 'City A' },
                    },
                    destinationAirport: {
                        name: 'Airport B',
                        city: { name: 'City B' },
                    },
                },
                returnFlight: null,
            },
        ];

        prisma.transaction.findMany.mockResolvedValue(mockData);

        const result = await getHistoryAndDetail(mockUserId);

        expect(prisma.transaction.findMany).toHaveBeenCalledOnce();
        expect(prisma.transaction.findMany).toHaveBeenCalledWith({
            where: {
                userId: BigInt(mockUserId),
                order: {
                    bookingCode: { not: null },
                },
            },
        
            select: {
                id: true,
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
                            logo: true,
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
                        city: {
                          select:{
                            name: true,
                          },
                        },
                      },
                    },
                    destinationAirport: {
                      select: {
                        name: true,
                        city: {
                          select:{
                            name: true,
                          },
                        },
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
                            logo: true,
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
                        city: {
                          select:{
                            name: true,
                          },
                        },
                      },
                    },
                    destinationAirport: {
                      select: {
                        name: true,
                        city: {
                          select: {
                            name: true,
                          }
                        }
                      },
                    },
                  },
                },
            },
        });
        expect(result).toEqual(mockData);
    });
});