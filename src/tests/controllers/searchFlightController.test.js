import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchFlightController } from '../../controllers/homepageController.js'; 
import { getFlights } from '../../services/Flight.js';
import convertToJson from '../../utils/convertToJson.js';
import { mockResponse, mockRequest } from '../../utils/mockHelpers.js';

vi.mock('../../services/Flight.js', () => ({
  getFlights: vi.fn(),
}));

vi.mock('../../utils/convertToJson.js', () => ({
  default: vi.fn(),
}));

describe('searchFlightController', () => {
  let req;
  let res;

  beforeEach(() => {
    vi.clearAllMocks();
    req = mockRequest({
      query: {
        departure: '5',
        destination: '1',
        departureDate: '2024-12-20',
        passengers: '2',
        seatClass: 'economy',
      },
    });
    res = mockResponse();
  });

  // validasi input (Joi)
  it('Mengembalikan kesalahan validasi Joi', async () => {
    req.query.departureDate = undefined; 

    await searchFlightController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: expect.stringContaining('\"departureDate\" must be a valid date'),
    });
  });
  
  // validasi jumlah penumpang
  it('Mengembalikan kesalahan jika penumpang melebihi 9', async () => {
    req.query.passengers = '10';

    await searchFlightController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Maksimum 9 penumpang. (Dewasa dan Anak).',
    });
  });

  // default seatClass
  it('Menggunakan seatClass default "economy" jika seatClass tidak diberikan', async () => {  
    req.query.seatClass = undefined; // tidak memberikan seatClass
  
    const mockDepartureFlights = [
      {
        id: 1,
        airplane: { seat: [{ status: 'available' }, { status: 'available' }] },
        departureAirport: { city: { id: 5 } },
        destinationAirport: { city: { id: 1 } },
        departureDate: '2024-12-20',
        class: 'economy', // default menjadi 'economy'
      },
    ];
  
    getFlights.mockResolvedValue(mockDepartureFlights);
    convertToJson.mockReturnValue(mockDepartureFlights);
  
    await searchFlightController(req, res);
  
    expect(getFlights).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ class: 'economy' }), // validasi penggunaan default
      })
    );
  
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Penerbangan ditemukan.',
      data: { 
        departureFlights: mockDepartureFlights, 
        returnFlights: [] 
      },
    });
  });
  
  // hasil pencarian keberangkatan
  it('Mengembalikan penerbangan keberangkatan ketika data yang valid diberikan', async () => {
    const mockDepartureFlights = [
      {
        id: 4,
        airplane: { seat: [{ status: 'available' }, { status: 'available' }] },
        departureAirport: { city: { id: 5 } },
        destinationAirport: { city: { id: 1 } },
        departureDate: '2024-12-20',
        class: 'economy',
      },
    ];

    getFlights.mockResolvedValue(mockDepartureFlights);
    convertToJson.mockReturnValue(mockDepartureFlights);

    await searchFlightController(req, res);

    expect(getFlights).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Penerbangan ditemukan.',
      data: {
        departureFlights: mockDepartureFlights,
        returnFlights: [],
      },
    });
  });

  // hasil pencarian kepulangan
  it('Mengembalikan penerbangan pulang ketika data yang valid diberikan', async () => {
    req.query.returnDate = '2024-12-26';
    const mockDepartureFlights = [
      {
        id: 4,
        airplane: { seat: [{ status: 'available' }, { status: 'available' }] },
        departureAirport: { city: { id: 5 } },
        destinationAirport: { city: { id: 1 } },
        departureDate: '2024-12-20',
        class: 'economy',
      },
    ];
    const mockReturnFlights = [
      {
        id: 3,
        airplane: { seat: [{ status: 'available' }, { status: 'available' }] },
        departureAirport: { city: { id: 1 } },
        destinationAirport: { city: { id: 5 } },
        departureDate: '2024-12-26',
        class: 'economy',
      },
    ];

    getFlights.mockResolvedValueOnce(mockDepartureFlights).mockResolvedValueOnce(mockReturnFlights);
    convertToJson.mockReturnValueOnce(mockDepartureFlights).mockReturnValueOnce(mockReturnFlights);

    await searchFlightController(req, res);

    expect(getFlights).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Penerbangan ditemukan.',
      data: {
        departureFlights: mockDepartureFlights,
        returnFlights: mockReturnFlights,
      },
    });
  });

  // kondisi tidak ada penerbangan atau tiket habis
  it('Mengembalikan kesalahan jika tidak ada penerbangan', async () => {
    getFlights.mockResolvedValue([]);

    await searchFlightController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Maaf, pencarian Anda tidak ditemukan. Coba cari perjalanan lainnya.',
    });
  });

  it('Mengembalikan kesalahan tiket terjual habis untuk penerbangan keberangkatan', async () => {
    const mockDepartureFlights = [
      {
        id: 4,
        airplane: { seat: [{ status: 'booked' }, { status: 'booked' }] },
        departureAirport: { city: { id: 5 } },
        destinationAirport: { city: { id: 1 } },
        departureDate: '2024-12-20',
        class: 'economy',
      },
    ];

    getFlights.mockResolvedValue(mockDepartureFlights);

    await searchFlightController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Maaf, Tiket terjual habis. Coba cari perjalanan lain.',
    });
  });

  it('Mengembalikan kesalahan jika tidak ada penerbangan pulang yang tersedia', async () => {
    req.query.returnDate = '2024-12-26';
  
    const mockDepartureFlights = [
      {
        id: 4,
        airplane: { seat: [{ status: 'available' }, { status: 'available' }] },
        departureAirport: { city: { id: 5 } },
        destinationAirport: { city: { id: 1 } },
        departureDate: '2024-12-20',
        class: 'economy',
      },
    ];
    const mockReturnFlights = [];
  
    getFlights.mockResolvedValueOnce(mockDepartureFlights).mockResolvedValueOnce(mockReturnFlights);
  
    await searchFlightController(req, res);
  
    expect(getFlights).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Maaf, pencarian Anda tidak ditemukan untuk kepulangan. Coba cari perjalanan lainnya.',
    });
  });
  
  it('Mengembalikan kesalahan tiket terjual habis untuk penerbangan pulang', async () => {
    req.query.returnDate = '2024-12-26';
    const mockDepartureFlights = [
      {
        id: 4,
        airplane: { seat: [{ status: 'available' }, { status: 'available' }] },
        departureAirport: { city: { id: 5 } },
        destinationAirport: { city: { id: 1 } },
        departureDate: '2024-12-20',
        class: 'economy',
      },
    ];
    const mockReturnFlights = [
      {
        id: 3,
        airplane: { seat: [{ status: 'booked' }, { status: 'booked' }] },
        departureAirport: { city: { id: 1 } },
        destinationAirport: { city: { id: 5 } },
        departureDate: '2024-12-26',
        class: 'economy',
      },
    ];

    getFlights.mockResolvedValueOnce(mockDepartureFlights).mockResolvedValueOnce(mockReturnFlights);

    await searchFlightController(req, res);

    expect(getFlights).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Maaf, Tiket terjual habis untuk kepulangan. Coba cari perjalanan lain.',
    });
  });

  // server error
  it('Mengembalikan kesalahan server', async () => {
    const error = new Error();
  delete error.message; 
  getFlights.mockRejectedValue(error);

  await searchFlightController(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({
    status: 'error',
    message: 'Terjadi kesalahan saat mencari penerbangan.', 
  });
});
});