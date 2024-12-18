import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCitiesController } from '../../controllers/homepageController.js';
import { getCities } from '../../services/City.js';
import { mockResponse, mockRequest } from '../../utils/mockHelpers.js';

vi.mock('../../services/City.js', () => ({
  getCities: vi.fn()
}));

describe('getCitiesController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Berhasil mengembalikan data kota', async () => {
    const mockCities = [
      { 
        id: 1, 
        name: 'Jakarta', 
        cityCode: 'JKT', 
        countryId: 1,
        country: { id: 1, name: 'Indonesia' }
      },
      { 
        id: 2, 
        name: 'Surabaya', 
        cityCode: 'SUB', 
        countryId: 1,
        country: { id: 1, name: 'Indonesia' }
      }
    ];
    getCities.mockResolvedValue(mockCities);

    const req = mockRequest();
    const res = mockResponse();

    await getCitiesController(req, res);

    expect(getCities).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: mockCities,
    });
  });
});
