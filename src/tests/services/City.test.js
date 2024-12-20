import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { getCities } from '../../services/City.js';

vi.mock('@prisma/client', () => {
  const mockPrismaClient = {
    city: {
      findMany: vi.fn(),
    },
  };
  return { PrismaClient: vi.fn(() => mockPrismaClient) };
});

describe('getCities', () => {
  let prismaMock;

  beforeEach(() => {
    prismaMock = new PrismaClient();
  });

  it('Mengembalikan daftar kota dengan negaranya', async () => {
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

    prismaMock.city.findMany.mockResolvedValue(mockCities);

    const result = await getCities();

    expect(prismaMock.city.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.city.findMany).toHaveBeenCalledWith({
      include: {
        country: true,
      },
    });
    expect(result).toEqual(mockCities);
  });
});