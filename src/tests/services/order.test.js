import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
    createEmptyOrderer,
    getOrdererByBookingCode,
    getOrdererById,
    updateOrdererById
} from "../../services/Orderer.js";
import { PrismaClient } from "@prisma/client";


vi.mock("@prisma/client", () => {
    const mockPrismaClient = {
        orderer: {
            create: vi.fn(),
            update: vi.fn(),
            findUnique: vi.fn(),
            findFirst: vi.fn(),
        },
    };
    return { PrismaClient: vi.fn(() => mockPrismaClient) };
});

const prismaMock = new PrismaClient();

describe("Orderer Service", () => {
    it("should create an empty orderer and return the created orderer", async () => {
      const mockOrderer = {
        id: 1,
        fullname: '',
        email: '',
        numberPhone: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
  
      // Mock Prisma's create method
      prismaMock.orderer.create.mockResolvedValueOnce(mockOrderer);
  
      // Call the service function
      const result = await createEmptyOrderer();
  
      // Assertions
      expect(prismaMock.orderer.create).toHaveBeenCalledOnce();
      expect(prismaMock.orderer.create).toHaveBeenCalledWith({
        data: { fullname: '', email: '', numberPhone: '' },
      });
      expect(result).toEqual(mockOrderer);
    });

    it("should update an orderer by ID and return the updated orderer", async () => {
        const mockOrdererId = 1;
        const mockData = {
            fullname: "Updated Name",
            email: "updated@example.com",
            numberPhone: "123456789",
        };
        const mockUpdatedOrderer = {
            id: mockOrdererId,
            fullname: "Updated Name",
            email: "updated@example.com",
            numberPhone: "123456789",
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        
        // Mock Prisma's update method
        prismaMock.orderer.update.mockResolvedValueOnce(mockUpdatedOrderer);
        
        // Call the service function
        const result = await updateOrdererById(mockOrdererId, mockData);
        
        // Assertions
        expect(prismaMock.orderer.update).toHaveBeenCalledOnce();
        expect(prismaMock.orderer.update).toHaveBeenCalledWith({
            where: { id: mockOrdererId },
            data: mockData,
        });
        expect(result).toEqual(mockUpdatedOrderer);
    });

    it('should return the correct orderer by id', async () => {
        const ordererId = 1;
        const mockOrderer = { id: ordererId, name: 'John Doe', email: 'john@example.com' };
        
        // Mock the findUnique method to return a mock orderer
        prismaMock.orderer.findUnique.mockResolvedValue(mockOrderer);
        
        const result = await getOrdererById(ordererId);
        
        expect(result).toEqual(mockOrderer);
        expect(prismaMock.orderer.findUnique).toHaveBeenCalledWith({ where: { id: ordererId } });
    });
    
    it('should return the correct orderer by booking code', async () => {
        const bookingCode = 'ABC123';
        const mockOrderer = { id: 1, name: 'John Doe', bookingCode, email: 'john@example.com' };
        
        // Mock the findFirst method to return a mock orderer
        prismaMock.orderer.findFirst.mockResolvedValue(mockOrderer);
        
        const result = await getOrdererByBookingCode(bookingCode);
        
        expect(result).toEqual(mockOrderer);
        expect(prismaMock.orderer.findFirst).toHaveBeenCalledWith({ where: { bookingCode } });
    });
    
});