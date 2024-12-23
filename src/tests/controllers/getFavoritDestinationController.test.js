import { describe, it, expect, vi, beforeEach } from "vitest";
import { getFavoriteDestinationController } from "../../controllers/favoritedestinationController.js";
import { getFlights } from "../../services/Flight.js";
import { mockResponse, mockRequest } from "../../utils/mockHelpers.js";
import asyncWrapper from "../../utils/asyncWrapper.js";

vi.mock("../../services/Flight.js", () => ({
  getFlights: vi.fn(),
}));

vi.mock("../../utils/asyncWrapper.js", () => {
  return {
    default: (fn) => fn,
  };
});

describe("getFavoriteDestinationController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Berhasil mengembalikan data destinasi favorit", async () => {
    const mockFlights = [
      {
        id: 1,
        price: 150,
        departureAirport: {
          id: 101,
          name: "Soekarno-Hatta International Airport",
          city: {
            id: 1,
            name: "Jakarta",
            country: {
              continent: {
                id: 1,
                name: "Asia",
              },
            },
          },
        },
        destinationAirport: {
          id: 201,
          name: "Singapore Changi Airport",
          city: {
            id: 2,
            name: "Singapore",
            country: {
              continent: {
                id: 1,
                name: "Asia",
              },
            },
          },
        },
        departureDate: "2024-12-25T00:00:00.000Z",
        arrivalDate: "2024-12-25T04:00:00.000Z",
        departureTime: "10:00",
        arrivalTime: "14:00",
        airplane: {
          airplaneCode: "BA001",
          totalSeat: 12,
          baggage: 20,
          cabinBaggage: 7,
          airline: {
            id: 1,
            name: "Garuda Indonesia",
            logo: "garuda-logo.png",
          },
          seat: [
            { id: 1, status: "available" },
            { id: 2, status: "booked" },
          ],
        },
        class: "economy",
      },
    ];    

    getFlights.mockResolvedValue(mockFlights);

    const req = mockRequest({
      query: {
        continent: 1,
        date: "2024-12-24",
      },
    });
    const res = mockResponse();

    await getFavoriteDestinationController(req, res);

    expect(getFlights).toHaveBeenCalledOnce();
    expect(getFlights).toHaveBeenCalledWith({
      where: {
        departureDate: {
          gte: new Date("2024-12-25T00:00:00.000Z"), // esok hari
          lte: new Date("2025-01-04T00:00:00.000Z"), // 10 hari kemudian
        },
        OR: [
          {
            departureAirport: {
              city: {
                country: {
                  continent: {
                    id: 1,
                  },
                },
              },
            },
          },
          {
            destinationAirport: {
              city: {
                country: {
                  continent: {
                    id: 1,
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        airplane: {
          include: {
            airline: true,
            seat: true,
          },
        },
        departureAirport: {
          include: {
            city: {
              include: {
                country: {
                  include: {
                    continent: true,
                  },
                },
              },
            },
          },
        },
        destinationAirport: {
          include: {
            city: {
              include: {
                country: {
                  include: {
                    continent: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Penerbangan ditemukan",
      data: [
        {
          flightId: "1",
          departureCityId: "1",
          departureCity: "Jakarta",
          departureAirportId: "101",
          departureAirportName: "Soekarno-Hatta International Airport",
          destinationCityId: "2",
          destinationCity: "Singapore",
          destinationAirportId: "201",
          destinationAirportName: "Singapore Changi Airport",
          departureDate: "2024-12-25T00:00:00.000Z",
          arrivalDate: "2024-12-25T04:00:00.000Z",
          departureTime: "10:00",
          arrivalTime: "14:00",
          airlineId: "1",
          airline: "Garuda Indonesia",
          logo: "garuda-logo.png",
          seatClass: "economy",
          airplaneCode: "BA001",
          totalSeat: 12,
          baggage: 20,
          cabinBaggage: 7,
          price: 150,
        },
      ],
    });    
  });

  it("Mengembalikan status 404 jika tidak ada penerbangan", async () => {
    getFlights.mockResolvedValue([]);

    const req = mockRequest({
      query: {
        continent: "1",
        date: "2024-12-24",
      },
    });
    const res = mockResponse();

    await getFavoriteDestinationController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Tidak ada penerbangan tersedia",
      data: [],
    });
  });

  it("Mengembalikan status 400 jika input tidak valid", async () => {
    const req = mockRequest({
      query: {
        continent: "invalid", // benua tidak valid
        date: "2024-12-24",
      },
    });
    const res = mockResponse();

    await getFavoriteDestinationController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: expect.stringContaining("must be a number"),
    });
  });

  it("Mengembalikan kesalahan server", async () => {
    getFlights.mockRejectedValue(new Error("Database error"));

    const req = mockRequest({
      query: {
        continent: "1",
        date: "2024-12-24",
      },
    });
    const res = mockResponse();

    await getFavoriteDestinationController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Terjadi kesalahan pada server",
    });
  });
});
