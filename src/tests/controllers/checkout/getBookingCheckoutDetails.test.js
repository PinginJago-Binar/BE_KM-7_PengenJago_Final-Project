import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBookingCheckoutDetails } from '../../../controllers/checkoutController.js'; 
import { getTransactionByIdAndUser } from '../../../services/Transaction.js';
import { getDetailFlightById } from '../../../services/Flight.js';
import { groupPassengersByType, getPassengerByOrdererId } from '../../../services/Passenger.js';
import { getOrdererById } from '../../../services/Orderer.js';
import convertToJson from '../../../utils/convertToJson.js';

vi.mock('../../../services/Transaction.js');
vi.mock('../../../services/Flight.js');
vi.mock('../../../services/Passenger.js');
vi.mock('../../../services/Orderer.js');
vi.mock('../../../utils/convertToJson.js', () => ({
  default: vi.fn(),
}));

vi.mock("../../../utils/asyncWrapper.js", () => {
  return {
    default: (fn) => fn,
  };
});

describe('getBookingCheckoutDetails', () => {
  let mockRequest, mockResponse;

  beforeEach(() => {
    mockRequest = {
      params: {
        transactionid: 4,
        userid: 1,
      },
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    vi.clearAllMocks();
  });

  it('should return 404 if transaction not found', async () => {

    getTransactionByIdAndUser.mockResolvedValueOnce(null);

    await getBookingCheckoutDetails(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 404,
      message: 'Transaction not found!',
    });
  });

  it('should return 404 if departure flight not found', async () => {    
      
    const mockGetTransactionByIdAndUser = vi.mocked(getTransactionByIdAndUser);
    
    mockGetTransactionByIdAndUser.mockResolvedValueOnce({
      departureFlightId: 4,
      returnFlightId: null,
      ordererId: 2,
    });
      
    const mockGetDetailFlightById = vi.mocked(getDetailFlightById);
    mockGetDetailFlightById.mockResolvedValueOnce(null);
      
    await getBookingCheckoutDetails(mockRequest, mockResponse);

  
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 404,
      message: 'Jadwal penerbangan keberangkatan tidak ditemukan',
    });
  });

  it('should return 404 if return flight not found for round-trip', async () => {
    getTransactionByIdAndUser.mockResolvedValueOnce({
      departureFlightId: 5,
      returnFlightId: 7,
      ordererId: 2,
    });

    getDetailFlightById
      .mockResolvedValueOnce({ flightId: 5, details: 'Departure flight details' })
      .mockResolvedValueOnce(null);

    await getBookingCheckoutDetails(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 404,
      message: 'Jadwal penerbangan pulang tidak ditemukan',
    });
  });
  
  
  it('should return 200 with correct response structure on success', async () => {
    getTransactionByIdAndUser.mockResolvedValueOnce({
      departureFlightId: 5,
      returnFlightId: 10,
      ordererId: 2,
      amount: 870000,
      amountAfterTax: 896100,
    });

    getDetailFlightById
      .mockResolvedValueOnce({ price: 100000 }) 
      .mockResolvedValueOnce({ price: 200000 });
    
    groupPassengersByType.mockResolvedValueOnce([
      { passengerType: 'adult', _count: { passengerType: 2 }, flightType: 'departure' },
      { passengerType: 'child', _count: { passengerType: 1 }, flightType: 'return' },
    ]);
    
    getPassengerByOrdererId.mockResolvedValueOnce([{ id: 1, name: 'John Doe' }]);
    getOrdererById.mockResolvedValueOnce({ id: 2, name: 'Jane Doe' });
    
    convertToJson.mockImplementation((data) => data);

    await getBookingCheckoutDetails(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 200,
      message: 'success',
      data: {
        transaction: {
          departureFlightId: 5,
          returnFlightId: 10,
          ordererId: 2,
          amount: 870000,
          amountAfterTax: 896100,
        },
        passengers: [
          { id: 1, name: 'John Doe' },
        ],
        orderer: { id: 2, name: 'Jane Doe' },
        flights: {
          departure: { price: 100000 },
          return: { price: 200000 },
        },
        priceDetails: {
          passenger: [
            {
              count: 2,
              flightType: "departure",
              total: 200000,
              type: "adult"
            },
            {
              count: 1,
              flightType: "return",
              total: 180000,
              type: "child"
            },
          ],
          tax: 26100,
          totalPayBeforeTax: 870000,
          totalPayAfterTax: 896100,
        },
      },
    });
  });

});