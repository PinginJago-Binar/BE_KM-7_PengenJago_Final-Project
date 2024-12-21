import { describe, it, expect, vi, beforeEach } from "vitest";
import { getFlightsController } from "../../controllers/favoritedestinationController.js";
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

describe("getFlightsController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Berhasil mengembalikan data penerbangan", async () => {
    const mockFlights = [
      {
        id: 1,
        price: 150,
        departureAirport: {
          cityId: "1",
          city: {
            name: "Jakarta",
            country: {
              name: "Indonesia",
              continent: {
                name: "Asia",
              },
            },
          },
        },
        destinationAirport: {
          cityId: "2",
          city: {
            name: "Singapore",
            country: {
              name: "Singapore",
              continent: {
                name: "Asia",
              },
            },
          },
        },
        departureDate: "2024-12-25",
        airplane: {
          seat: [
            { id: 1, seatNumber: "A1" },
            { id: 2, seatNumber: "A2" },
          ],
        },
        departureTerminal: { name: "Terminal 1" },
      },
    ];

    getFlights.mockResolvedValue(mockFlights);

    const req = mockRequest({
      body: {
        departure: "1",
        destination: "2",
        startDate: "2024-12-20T00:00:00.000Z",
        endDate: "2024-12-30T23:59:59.999Z",
        minPrice: 100,
      },
    });
    const res = mockResponse();

    await getFlightsController(req, res);

    expect(getFlights).toHaveBeenCalledOnce();
    expect(getFlights).toHaveBeenCalledWith({
      where: {
        departureAirport: { cityId: "1" },
        destinationAirport: { cityId: "2" },
        departureDate: {
          gte: "2024-12-20T00:00:00.000Z",
          lte: "2024-12-30T23:59:59.999Z",
        },
        price: {
          gte: 100,
        },
      },
      include: {
        airplane: {
          include: {
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
        departureTerminal: true,
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: mockFlights,
    });
  });
});