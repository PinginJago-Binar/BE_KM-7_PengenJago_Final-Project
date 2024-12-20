import { describe, it, expect, beforeEach, vi } from "vitest";
import { PrismaClient } from "@prisma/client";
import { groupPassengersByType } from "../../services/Transaction.js";


vi.mock('@prisma/client', () => {
  const mockPrismaClient = {
      passenger : {
        groupBy: vi.fn(),
      },
  };
  return { PrismaClient: vi.fn(() => mockPrismaClient) };
});

const prismaMock = new PrismaClient()

describe("groupPassengersByType", () => {
  beforeEach(() => {
    vi.resetAllMocks(); 
  });

  it("mengembalikan data grupPassenger dengan type and flight type", async () => {
    const orderedId = BigInt(3);

    const mockGroupedPassengers = [
      { _count: { passengerType: 2 }, passengerType: "adult", flightType: "departure" },
      { _count: { passengerType: 1 }, passengerType: "child", flightType: "return" },
      { _count: { passengerType: 3 }, passengerType: "baby", flightType: "return" },
    ];

    prismaMock.passenger.groupBy.mockResolvedValueOnce(mockGroupedPassengers);

    const result = await groupPassengersByType(orderedId);

    expect(prismaMock.passenger.groupBy).toHaveBeenCalledWith({
      by: ["passengerType", "flightType"],
      where: { orderedId },
      _count: {
        passengerType: true,
      },
    });
    expect(result).toEqual(mockGroupedPassengers);
  });
});

