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
  
  it("should return transaction history and details for a valid userId", async () => {
    // Mock data returned by Prisma
    const mockData = [
      {
        id: 1,
        status: "completed",
        amount: 1000,
        amountAfterTax: 900,
        order: {
          id: 1,
          bookingCode: "ABC123",
          pasengger: [
            {
              passengerType: "Adult",
              fullname: "John Doe",
              familyName: "Doe",
            },
          ],
        },
        departureFlight: {
          airplane: {
            airplaneCode: "A123",
            airline: {
              name: "Airline A",
              logo: "logo-url",
            },
          },
          price: 500,
          class: "Economy",
          departureTerminal: {
            name: "Terminal 1",
          },
          departureDate: "2024-12-25",
          departureTime: "10:00",
          arrivalDate: "2024-12-25",
          arrivalTime: "12:00",
          departureAirport: {
            name: "Airport A",
            city: {
              name: "City A",
            },
          },
          destinationAirport: {
            name: "Airport B",
            city: {
              name: "City B",
            },
          },
        },
        returnFlight: {
          airplane: {
            airplaneCode: "B456",
            airline: {
              name: "Airline B",
              logo: "logo-url-2",
            },
          },
          price: 500,
          class: "Business",
          departureTerminal: {
            name: "Terminal 2",
          },
          departureDate: "2024-12-30",
          departureTime: "14:00",
          arrivalDate: "2024-12-30",
          arrivalTime: "16:00",
          departureAirport: {
            name: "Airport C",
            city: {
              name: "City C",
            },
          },
          destinationAirport: {
            name: "Airport D",
            city: {
              name: "City D",
            },
          },
        },
      },
    ];

    // Mock Prisma call
    prisma.transaction.findMany = vi.fn().mockResolvedValue(mockData);

    // Call the function with a valid userId
    const result = await getHistoryAndDetail(1);

    // Assertions
    expect(prisma.transaction.findMany).toHaveBeenCalledWith({
      where: {
        userId: BigInt(1),
        order: {
          bookingCode: { not: null },
        },
      },
      select: expect.any(Object), // Validate the presence of a select clause
    });

    expect(result).toEqual(mockData); // Ensure the returned data matches mockData
  });
});