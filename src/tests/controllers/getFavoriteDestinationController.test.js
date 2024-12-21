import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFavoriteDestinationController } from '../../controllers/favoritedestinationController.js';
import { getFlights } from '../../services/Flight.js';
import convertToJson from '../../utils/convertToJson.js';
import { mockResponse, mockRequest } from '../../utils/mockHelpers.js';
import asyncWrapper from '../../utils/asyncWrapper.js';

vi.mock('../../services/Flight.js', () => ({
  getFlights: vi.fn(),
}));

vi.mock('../../utils/convertToJson.js', () => ({
  default: vi.fn(),
}));

vi.mock('../../utils/asyncWrapper.js', () => {
  return {
    default: (fn) => fn,
  };
});

describe('getFavoriteDestinationController', () => {
  let req;
  let res;

  beforeEach(() => {
    vi.clearAllMocks();
    req = mockRequest({
      query: {
        departure: '1',
        destination: '2',
        startDate: '2024-12-20',
        endDate: '2024-12-30',
        minPrice: '1000',
      },
    });
    res = mockResponse();
  });

  it('Mengembalikan kesalahan validasi Joi jika input tidak valid', async () => {
    req.query.startDate = undefined;

    await getFavoriteDestinationController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: expect.stringContaining('\"startDate\" must be a valid date'),
    });
  });

  it('Mengembalikan kesalahan jika tidak ada penerbangan ditemukan', async () => {
    getFlights.mockResolvedValue([]);

    await getFavoriteDestinationController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Tidak ada penerbangan yang ditemukan',
    });
  });

  it('Mengembalikan kesalahan jika semua tiket terjual habis', async () => {
    const mockFlights = [
      {
        airplane: { seat: [{ status: 'booked' }, { status: 'booked' }] },
      },
    ];
    getFlights.mockResolvedValue(mockFlights);

    await getFavoriteDestinationController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Maaf, Tiket terjual habis. Coba cari perjalanan lain.',
    });
  });

  it('Mengembalikan penerbangan yang tersedia jika data valid diberikan', async () => {
    const mockFlights = [
      {
        airplane: { seat: [{ status: 'available' }, { status: 'booked' }] },
      },
    ];
    getFlights.mockResolvedValue(mockFlights);
    convertToJson.mockReturnValue(mockFlights);

    await getFavoriteDestinationController(req, res);

    expect(getFlights).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Penerbangan ditemukan',
      data: mockFlights,
    });
  });

  it('Mengembalikan kesalahan server jika terjadi masalah pada server', async () => {
    getFlights.mockRejectedValue(new Error('Server Error'));

    await getFavoriteDestinationController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  });
});
