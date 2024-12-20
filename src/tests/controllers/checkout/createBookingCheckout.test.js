import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFlightById } from '../../../services/Flight.js';
import { createBookingCheckout } from '../../../controllers/checkoutController';

vi.mock('../../../services/Flight.js');
vi.mock('../../../utils/convertToJson.js', () => ({
  default: vi.fn(),
}));
vi.mock("../../../utils/asyncWrapper.js", () => {
  return {
    default: (fn) => fn,
  };
});


describe('POST /booking/checkout', () => {
  let mockRequest, mockResponse;

  beforeEach(() => {    

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    vi.clearAllMocks();
  });


  it('should return 404 if departure flight not found', async () => {    
    
    mockRequest = {
      body: {
        userId: '1',
        passengers: JSON.stringify({ adult: 2, child: 1, baby: 0 }),
        flightIds: JSON.stringify({ departure: 5, return: 10 }),
        pp: 'true'
      }
    };

    getFlightById.mockResolvedValueOnce(null);

    await createBookingCheckout(mockRequest, mockResponse, () => {});

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 404,
      message: 'Jadwal penerbangan keberangkatan tidak ditemukan',
    });
  });

  // it('should return 404 if return flight not found when pp is true', async () => {
  //   getFlightById.mockResolvedValueOnce({}); // Mock flight keberangkatan
  //   getFlightById.mockResolvedValueOnce(null); // Mock flight pulang

  //   const response = await request(app)
  //     .post('/booking/checkout')
  //     .send(mockRequestBody);

  //   expect(response.status).toBe(404);
  //   expect(response.body.message).toBe('Jadwal penerbangan pulang tidak ditemukan');
  // });

  // it('should return 400 if there are not enough available tickets', async () => {
  //   getFlightById.mockResolvedValueOnce({ airplaneId: 1, price: '100000' }); // Mock flight keberangkatan
  //   getFlightById.mockResolvedValueOnce({ airplaneId: 2, price: '200000' }); // Mock flight pulang

  //   getAvailableTickets.mockResolvedValueOnce(2); // Tersedia 2 tiket untuk keberangkatan
  //   getAvailableTickets.mockResolvedValueOnce(2); // Tersedia 2 tiket untuk kepulangan

  //   const response = await request(app)
  //     .post('/booking/checkout')
  //     .send(mockRequestBody);

  //   expect(response.status).toBe(400);
  //   expect(response.body.message).toContain('tiket sudah habis');
  // });

  // it('should successfully create booking when all data is valid', async () => {
  //   getFlightById.mockResolvedValueOnce({ airplaneId: 1, price: '100000' }); // Mock flight keberangkatan
  //   getFlightById.mockResolvedValueOnce({ airplaneId: 2, price: '200000' }); // Mock flight pulang

  //   getAvailableTickets.mockResolvedValueOnce(10); // Tersedia 10 tiket untuk keberangkatan
  //   getAvailableTickets.mockResolvedValueOnce(10); // Tersedia 10 tiket untuk kepulangan

  //   createEmptyOrderer.mockResolvedValueOnce({ id: 1 }); // Orderer berhasil dibuat
  //   createPassenger.mockResolvedValueOnce([]); // Tidak ada masalah saat membuat penumpang
  //   createTransaction.mockResolvedValueOnce({ id: 1, amount: 300000, amountAfterTax: 315000 }); // Transaksi berhasil dibuat

  //   const response = await request(app)
  //     .post('/booking/checkout')
  //     .send(mockRequestBody);

  //   expect(response.status).toBe(200);
  //   expect(response.body.message).toBe('success create booking ticket for checkout');
  //   expect(response.body.data.transaction).toHaveProperty('id');
  //   expect(response.body.data.transaction.amount).toBe(300000);
  //   expect(response.body.data.transaction.amountAfterTax).toBe(315000);
  // });
});