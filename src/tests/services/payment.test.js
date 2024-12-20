import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPaymentDetail, getPaymentDetailByTransactionId } from "../../services/Payment.js";
import { PrismaClient } from "@prisma/client";

vi.mock("@prisma/client", () => {
    const mockPrisma = {
        paymentDetail: {
            create: vi.fn(),
            findFirst: vi.fn(),
        },
    };
    return { PrismaClient: vi.fn(() => mockPrisma) };    
});
  
const prisma = new PrismaClient();

describe("Payment service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create a payment detail and return the created record', async () => {
        const paymentData = { orderId: 1, amount: 100, paymentMethod: 'credit card' };
        const mockPaymentDetail = {
            id: 1,
            ...paymentData,
        };
        
        // Mock the create method to return the created payment detail
        prisma.paymentDetail.create.mockResolvedValue(mockPaymentDetail);
        
        const result = await createPaymentDetail(paymentData);
        
        // Check that the result matches the mock data
        expect(result).toEqual(mockPaymentDetail);
        expect(prisma.paymentDetail.create).toHaveBeenCalledWith({ data: paymentData });
    });

    it('should return the payment detail for the given transactionId', async () => {
        const transactionId = 'abc123';
        const mockPaymentDetail = {
            id: 1,
            transactionId,
            amount: 100,
            paymentMethod: 'credit card',
        };
        
        // Mock the findFirst method to return the mock payment detail
        prisma.paymentDetail.findFirst.mockResolvedValue(mockPaymentDetail);
        
        const result = await getPaymentDetailByTransactionId(transactionId);
        
        expect(result).toEqual(mockPaymentDetail);
        expect(prisma.paymentDetail.findFirst).toHaveBeenCalledWith({
            where: { transactionId },
        });
    });
        
})

