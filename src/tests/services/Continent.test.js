import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { getContinents } from '../../services/Continent.js';

vi.mock('@prisma/client', () => {
  const mockPrismaClient = {
    continent: {
      findMany: vi.fn(),
    },
  };
  return { PrismaClient: vi.fn(() => mockPrismaClient) };
});

describe('getContinents', () => {
  let prismaMock;

  beforeEach(() => {
    prismaMock = new PrismaClient();
  });

  it('Mengembalikan daftar benua dengan negaranya', async () => {
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

    prismaMock.continent.findMany.mockResolvedValue(mockContinents);

    const result = await getContinents();

    expect(prismaMock.continent.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.continent.findMany).toHaveBeenCalledWith({
      include: {
        country: true,
      },
    });
    expect(result).toEqual(mockContinents);
  });
});
