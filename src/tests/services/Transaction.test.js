import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
    createTransaction,
    getTransactionById, 
    getTransactionByIdAndUser, 
    getTransactionByOrdererId, 
    updateTransactionById 
} from "../../services/Transaction.js";
import { PrismaClient } from "@prisma/client";

vi.mock("@prisma/client", () => {
    const mockPrismaClient = {
        transaction: {
            create: vi.fn(),
            delete: vi.fn(),
            update: vi.fn(),
            findUnique: vi.fn(),
            findFirst: vi.fn(),
        },
    };
    return { PrismaClient: vi.fn(() => mockPrismaClient) };
});

const prismaMock = new PrismaClient();


describe("Transaction Service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    
    it("should create a new transaction successfully", async () => {
        const mockTransactionData = {
            userId: 1,
            ordererId: 2,
            departureFlightId: 10,
            returnFlightId: 20,
            status: "unpaid",
            amount: 1000,
            amountAfterTax: 1100,
            expiredFilling: "2024-12-31T23:59:59.000Z",
        };
        
        const mockCreatedTransaction = {
            id: 1,
            ...mockTransactionData,
            createdAt: new Date(),
        };
        
        // Mock Prisma's create method
        prismaMock.transaction.create.mockResolvedValueOnce(mockCreatedTransaction);
        
        // Call the service function
        const result = await createTransaction(mockTransactionData);
        
        // Assertions
        expect(prismaMock.transaction.create).toHaveBeenCalledOnce();
        expect(prismaMock.transaction.create).toHaveBeenCalledWith({
            data: mockTransactionData,
        });
        expect(result).toEqual(mockCreatedTransaction);
    });
    
    it("should return a transaction by ID", async () => {
        const mockTransactionId = 1;
        
        const mockTransaction = {
            id: mockTransactionId,
            userId: 2,
            amount: 1000,
            amountAfterTax: 1100,
            status: "unpaid",
            departureFlightId: 10,
            returnFlightId: 20,
            createdAt: new Date(),
        };
        
        // Mock Prisma's findUnique method
        prismaMock.transaction.findUnique.mockResolvedValueOnce(mockTransaction);
        
        // Call the service function
        const result = await getTransactionById(mockTransactionId);
        
        // Assertions
        expect(prismaMock.transaction.findUnique).toHaveBeenCalledOnce();
        expect(prismaMock.transaction.findUnique).toHaveBeenCalledWith({
            where: { id: mockTransactionId },
        });
        expect(result).toEqual(mockTransaction);
    });
    
    it("should return a transaction by ID and user ID", async () => {
        const mockTransactionId = 1;
        const mockUserId = 2;
        
        const mockTransaction = {
            id: mockTransactionId,
            userId: mockUserId,
            amount: 1000,
            amountAfterTax: 1100,
            status: "unpaid",
            departureFlightId: 10,
            returnFlightId: 20,
            createdAt: new Date(),
        };
        
        // Mock Prisma's findUnique method
        prismaMock.transaction.findUnique.mockResolvedValueOnce(mockTransaction);
        
        // Call the service function
        const result = await getTransactionByIdAndUser(mockTransactionId, mockUserId);
        
        // Assertions
        expect(prismaMock.transaction.findUnique).toHaveBeenCalledOnce();
        expect(prismaMock.transaction.findUnique).toHaveBeenCalledWith({
            where: {
                id: mockTransactionId,
                userId: mockUserId,
            },
        });
        expect(result).toEqual(mockTransaction);
    });
    
    it("should return a transaction by orderer ID", async () => {
        const mockOrdererId = 123;
        
        const mockTransaction = {
            id: 1,
            userId: 2,
            ordererId: mockOrdererId,
            amount: 1000,
            status: "unpaid",
            createdAt: new Date(),
        };
        
        // Mock Prisma's findFirst method
        prismaMock.transaction.findFirst.mockResolvedValueOnce(mockTransaction);
        
        // Call the service function
        const result = await getTransactionByOrdererId(mockOrdererId);
        
        // Assertions
        expect(prismaMock.transaction.findFirst).toHaveBeenCalledOnce();
        expect(prismaMock.transaction.findFirst).toHaveBeenCalledWith({
            where: {
                ordererId: mockOrdererId,
            },
        });
        expect(result).toEqual(mockTransaction);
    });

    it("should update a transaction and return the updated transaction", async () => {
        const mockTransactionId = 123;
        const mockData = { status: "paid", amount: 2000 };
    
        const mockUpdatedTransaction = {
          id: mockTransactionId,
          userId: 1,
          ordererId: 2,
          status: "paid",
          amount: 2000,
          amountAfterTax: 2200,
          createdAt: new Date(),
        };
    
        // Mock Prisma's update method
        prismaMock.transaction.update.mockResolvedValueOnce(mockUpdatedTransaction);
    
        // Call the service function
        const result = await updateTransactionById(mockTransactionId, mockData);
    
        // Assertions
        expect(prismaMock.transaction.update).toHaveBeenCalledOnce();
        expect(prismaMock.transaction.update).toHaveBeenCalledWith({
          where: { id: mockTransactionId },
          data: mockData,
        });
        expect(result).toEqual(mockUpdatedTransaction);
      });
});