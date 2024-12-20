import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getHistoryTransactionAndDetail } from '../../controllers/historyController.js';
import { getHistoryAndDetail, groupPassengersByType } from '../../services/Transaction.js';
import { mockRequest, mockResponse } from '../../utils/mockHelpers.js';
import asyncWrapper from '../../utils/asyncWrapper.js';

vi.mock('../../services/Transaction.js');

vi.mock("../../utils/asyncWrapper.js", () => {
  return {
    default: (fn) => fn,
  };
});

describe('getHistoryTransactionAndDetail', () => {
  let req, res;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    vi.clearAllMocks();
  });

  it('harus return 400 ketika tidak ada transaction ditemukan', async () => {

    getHistoryAndDetail.mockResolvedValue([]);

    req.params = { userId: '1' };

    await getHistoryTransactionAndDetail(req, res);

    expect(getHistoryAndDetail).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Anda belum melakukan pemesanan penerbangan.',
    });
  });

  it('harus return 200 dan transaction detail ketika transaksi ditemukan', async () => {
    const mockTransactions = [
      {
        id: '123',
        status: 'completed',
        amount: '1000',
        amountAfterTax: '1100',
        order: {
          id: '789',
          bookingCode: 'ABC123',
          pasengger: [
            { fullname: 'John', familyName: 'Doe' },
            { fullname: 'Jane', familyName: 'Smith' },
          ],
        },
        departureFlight: {
          price: '500',
          class: 'Economy',
          departureAirport: { name: 'Airport A', city: { name: 'City A' } },
          destinationAirport: { name: 'Airport B', city: { name: 'City B' } },
          departureDate: '2024-12-20',
          departureTime: '10:00',
          arrivalDate: '2024-12-20',
          arrivalTime: '12:00',
          airplane: {
            airplaneCode: 'XYZ',
            airline: { name: 'Airline A', logo: 'logo.png' },
          },
        },
        returnFlight: {
          price: '500',
          class: 'Economy',
          departureAirport: { name: 'Airport A', city: { name: 'City A' } },
          destinationAirport: { name: 'Airport B', city: { name: 'City B' } },
          departureDate: '2024-12-20',
          departureTime: '10:00',
          arrivalDate: '2024-12-20',
          arrivalTime: '12:00',
          airplane: {
            airplaneCode: 'XYZ',
            airline: { name: 'Airline A', logo: 'logo.png' },
          },
        }
      },
    ];

    const mockPassengers = [
      { passengerType: 'adult', _count: { passengerType: 1 }, flightType: 'departure' },
      { passengerType: 'child', _count: { passengerType: 1 }, flightType: 'departure' },
    ];

    getHistoryAndDetail.mockResolvedValue(mockTransactions);
    groupPassengersByType.mockResolvedValue(mockPassengers);

    req.params = { userId: '1' };

    await getHistoryTransactionAndDetail(req, res);

    expect(getHistoryAndDetail).toHaveBeenCalledWith('1');
    expect(groupPassengersByType).toHaveBeenCalledWith('789'); 
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.any(Array),
    });
  });
});
