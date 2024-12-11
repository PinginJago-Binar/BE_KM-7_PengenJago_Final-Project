import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchFlightController } from '../../controllers/homepageController.js'; 
import { getFlights } from '../../services/Flight.js';
import convertToJson from '../../utils/convertToJson.js';

vi.mock('../../services/Flight.js', () => ({
  getFlights: vi.fn(),
}));

vi.mock('../../utils/convertToJson.js', () => ({
  default: vi.fn(),
}));

const mockResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnThis();
  res.json = vi.fn().mockReturnThis();
  return res;
};

describe('searchFlightController', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      query: {
        departure: '1',
        destination: '2',
        departureDate: '2024-12-15',
        passengers: '2',
        seatClass: 'economy',
      },
    };
    res = mockResponse();
  });

  it('Mengembalikan penerbangan ketika data yang valid diberikan', async () => {
    const mockFlights = [
      {
        id: 1,
        airplane: { seat: [{ status: 'available' }, { status: 'available' }] },
        departureAirport: { city: { id: 1 } },
        destinationAirport: { city: { id: 2 } },
        departureDate: '2024-12-15',
      },
    ];

    getFlights.mockResolvedValue(mockFlights);
    convertToJson.mockReturnValue(mockFlights);

    await searchFlightController(req, res);

    expect(getFlights).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Penerbangan ditemukan.',
      data: {
        departureFlights: mockFlights,
        returnFlights: [],
      },
    });
  });

  it('Mengembalikan kesalahan jika penumpang melebihi 9', async () => {
    req.query.passengers = '10';

    await searchFlightController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Maksimum 9 penumpang. (Dewasa dan Anak).',
    });
  });

  it('Mengembalikan kesalahan jika tidak ada penerbangan', async () => {
    getFlights.mockResolvedValue([]);

    await searchFlightController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Maaf, pencarian Anda tidak ditemukan. Coba cari perjalanan lainnya.',
    });
  });

  it('Mengembalikan kesalahan jika tidak ada kursi yang tersedia', async () => {
    const mockFlights = [
      {
        id: 1,
        airplane: { seat: [{ status: 'booked' }, { status: 'booked' }] },
        departureAirport: { city: { id: 1 } },
        destinationAirport: { city: { id: 2 } },
        departureDate: '2024-12-15',
      },
    ];

    getFlights.mockResolvedValue(mockFlights);

    await searchFlightController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Maaf, Tiket terjual habis. Coba cari perjalanan lain.',
    });
  });

  it('Mengembalikan kesalahan server', async () => {
    getFlights.mockRejectedValue(new Error('Terjadi kesalahan saat mencari penerbangan.'));

    await searchFlightController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Terjadi kesalahan saat mencari penerbangan.',
    });
  });
});
