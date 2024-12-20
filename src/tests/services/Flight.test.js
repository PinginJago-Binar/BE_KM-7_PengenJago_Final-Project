import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  getFlights,
  getDetailFlightById,
  getFlightById
} from "../../services/Flight.js";
import { PrismaClient } from "@prisma/client";

vi.mock("@prisma/client", () => {
  const mockPrisma = {
    flight: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
  };
  return { PrismaClient: vi.fn(() => mockPrisma) };
});

const prisma = new PrismaClient();

describe("Flights service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Mengembalikan daftar penerbangan berdasarkan kriteria", async () => {
    const mockFlights = [
        {
          id: 1,
          airplaneId: 101,
          departureAirportId: 201,
          departureTerminalId: 301,
          destinationAirportId: 401,
          departureDate: new Date("2024-12-15T10:00:00Z"),
          departureTime: new Date("2024-12-15T10:00:00Z"),
          arrivalDate: new Date("2024-12-15T14:00:00Z"),
          arrivalTime: new Date("2024-12-15T14:00:00Z"),
          class: "economy",
          price: 500.00,
          airplane: {
            id: 101,
            name: "Boeing 737",
            airline: { id: 1001, name: "Airline A" },
          },
          departureAirport: {
            id: 201,
            name: "Airport A",
            code: "AAA",
          },
          destinationAirport: {
            id: 401,
            name: "Airport B",
            code: "BBB",
          },
          departureTerminal: {
            id: 301,
            name: "Terminal 1",
          },
        },
        {
          id: 2,
          airplaneId: 102,
          departureAirportId: 202,
          departureTerminalId: 302,
          destinationAirportId: 402,
          departureDate: new Date("2024-12-16T08:00:00Z"),
          departureTime: new Date("2024-12-16T08:00:00Z"),
          arrivalDate: new Date("2024-12-16T12:00:00Z"),
          arrivalTime: new Date("2024-12-16T12:00:00Z"),
          class: "business",
          price: 1500.00,
          airplane: {
            id: 102,
            name: "Airbus A320",
            airline: { id: 1002, name: "Airline B" },
          },
          departureAirport: {
            id: 202,
            name: "Airport C",
            code: "CCC",
          },
          destinationAirport: {
            id: 402,
            name: "Airport D",
            code: "DDD",
          },
          departureTerminal: {
            id: 302,
            name: "Terminal 2",
          },
        },
      ];      

    prisma.flight.findMany.mockResolvedValue(mockFlights);
    
    const criteria = { where: { class: "economy" } };
    const result = await getFlights(criteria);

    expect(prisma.flight.findMany).toHaveBeenCalledWith(criteria);
    expect(result).toEqual(mockFlights);
  });

  it('should return the correct flight for the given id', async () => {
    const flightId = 1;
    const mockFlight = { id: flightId, airline: 'Airline Name', destination: 'Destination' };

    // Mock the findUnique method to return the mock flight
    prisma.flight.findUnique.mockResolvedValue(mockFlight);

    const result = await getFlightById(flightId);

    expect(result).toEqual(mockFlight);
    expect(prisma.flight.findUnique).toHaveBeenCalledWith({
      where: { id: flightId },
    });
  });

  it('should return the correct flight with related details for the given flightId', async () => {
    const flightId = 1;
    const mockFlight = {
      id: flightId,
      departureAirport: { name: 'Airport A' },
      returnFlight: { id: 2, departure: '2024-12-20' },
      departureTerminal: { terminal: 'T1' },
      airplane: {
        id: 1,
        airline: { name: 'Airline A' },
        seat: [
          { id: 1, status: 'available' },
          { id: 2, status: 'booked' }
        ]
      }
    };

    // Mock the findFirst method to return the mock flight
    prisma.flight.findFirst.mockResolvedValue(mockFlight);

    const result = await getDetailFlightById(flightId);

    expect(result).toEqual(mockFlight);
    expect(prisma.flight.findFirst).toHaveBeenCalledWith({
      where: { id: flightId },
      include: {
        departureAirport: true,
        returnFlight: true,
        departureTerminal: true,
        airplane: {
          include: {
            airline: true,
            seat: true
          }
        }
      }
    });
  });
});