import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createNotificationUser } from '../../controllers/notificationController.js';
import { findUserId, createNotification } from '../../services/Notification.js';
import { mockRequest, mockResponse, mockRes } from '../../utils/mockHelpers.js';
import convertToJson from '../../utils/convertToJson';
import { PrismaClient } from '@prisma/client';

vi.mock("@prisma/client", () => {
    const mockPrisma = {
        notification: {
            create: vi.fn(),
        },
    };
    return { PrismaClient: vi.fn(() => mockPrisma) };
});

const prisma = new PrismaClient

vi.mock("../../services/Notification.js", () => ({
    findUserId: vi.fn(),
    createNotification: vi.fn(),
}));

vi.mock('../../utils/convertToJson.js', () => ({
    default: vi.fn(),
  }));

describe("Post Notification testing", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return 400 when required fields are missing", async () => {
        const req = mockRequest({ body: {} });
        const res = mockResponse();
        
        await createNotificationUser(req, res);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "userId, notifType, title, message dibutuhkan.",
        });
    });
    
    it("should return 404 when userId does not exist", async () => {
        const req = mockRequest({
            body: {
                userId: "1",
                notifType: "Promosi",
                title: "Diskon Besar!",
                message: "Nikmati diskon hingga 50%.",
            },
        });
        const res = mockResponse();
        
        findUserId.mockResolvedValueOnce(null);
        
        await createNotificationUser(req, res);
        
        expect(findUserId).toHaveBeenCalledWith("1");
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "userId tidak ada.",
        });
    });
    
    // it("should return 200 and create a notification if successful", async () => {
    //     // Mock data untuk request dan response
    //     const req = mockRequest({
    //         body: {
    //             userId: 1,
    //             notifType: "Info",
    //             title: "Test Notification",
    //             message: "Test message",
    //         },
    //     });
    //     const res = mockResponse();

    //     findUserId.mockResolvedValue({
    //         id: 1,
    //         name: "Test User",
    //         email: "test@example.com",
    //         gender: null,
    //         password: "testttttttt",
    //         otp: null,
    //         role: "buyer",
    //         createdAt: new Date(),
    //         updatedAt: null,
    //         verifiedAt: null,
    //         deletedAt: null,
    //         numberPhone: "3333333333332",
    //         otpExpiry: null,
    //     });
    //     // Mock hasil dari createNotification
    //     createNotification.mockResolvedValue({
    //         id: 1,
    //         userId: 1,
    //         notifType: "Info",
    //         title: "Test Notification",
    //         message: "Test message",
    //         createdAt: new Date(),
    //         isRead: false,
    //         updatedAt: null,
    //     });

    //     // Panggil fungsi controller
    //     await createNotificationUser(req, res);
    //     console.log("res.status.mock.calls:", res.status.mock.calls);
    //     console.log("res.json.mock.calls:", res.json.mock.calls);
        

    //     // Assertion
    //     expect(createNotification).toHaveBeenCalledWith({
    //         userId: 1,
    //         notifType: "Info",
    //         title: "Test Notification",
    //         message: "Test message",
    //     });
    //     expect(res.status).toHaveBeenCalledWith(200);
    //     expect(res.json).toHaveBeenCalledWith({
    //         success: true,
    //         data: {
    //             id: 1,
    //             userId: 1,
    //             notifType: "Info",
    //             title: "Test Notification",
    //             message: "Test message",
    //             createdAt: expect.any(Date),
    //             isRead: false,
    //             updatedAt: null,
    //         },
    //     });
    // });
});
