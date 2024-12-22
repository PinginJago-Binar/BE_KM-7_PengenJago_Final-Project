import { describe, it, expect, vi, beforeEach } from "vitest";
import { getContinentsController } from "../../controllers/favoritedestinationController.js";
import { getContinents } from "../../services/Continent.js";
import { mockResponse, mockRequest } from "../../utils/mockHelpers.js";
import asyncWrapper from "../../utils/asyncWrapper.js";

vi.mock("../../services/Continent.js", () => ({
  getContinents: vi.fn(),
}));

vi.mock("../../utils/asyncWrapper.js", () => {
  return {
    default: (fn) => fn,
  };
});

describe("getContinentsController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Berhasil mengembalikan data benua", async () => {
    const mockContinents = [
      {
        id: 1,
        name: 'Asia',
        country: [
          { id: 1, name: 'Indonesia' },
          { id: 2, name: 'Japan' },
        ],
      },
      {
        id: 2,
        name: 'Europe',
        country: [
          { id: 3, name: 'Germany' },
          { id: 4, name: 'France' },
        ],
      },
    ];
    
    getContinents.mockResolvedValue(mockContinents);

    const req = mockRequest();
    const res = mockResponse();

    await getContinentsController(req, res);

    expect(getContinents).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: mockContinents,
    });
  });
});
