import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createNotificationUser } from '../../controllers/notificationController.js';
import { findUserId, createNotification } from '../../services/Notification.js';
import { mockRequest, mockResponse } from '../../utils/mockHelpers.js';
import convertToJson from '../../utils/convertToJson';
import { PrismaClient } from '@prisma/client';
import asyncWrapper from '../../utils/asyncWrapper.js';

vi.mock("../../utils/asyncWrapper.js", () => {
    return {
        default: (fn) => fn,
    };
});


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

    it("harus return 400 ketika required fields tidak ada", async () => {
        const req = mockRequest({ body: {} });
        const res = mockResponse();
        
        await createNotificationUser(req, res);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "userId, notifType, title, message dibutuhkan.",
        });
    });
    
    it("harus return 404 ketika userId tidak ditemukan", async () => {
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
    
    it('harus return 200 dan membuat sebuah notification jika semua fields valid', async () => {
        const mockNotification = {
            id: 1,
            userId: '1',
            notifType: 'Info',
            title: 'Test Title',
            message: 'Test Message',
            isRead: false,
            createdAt: new Date(),
            updatedAt: null
        };

        const req = mockRequest({ body: { userId: '1', notifType: 'Info', title: 'Test Title', message: 'Test Message' } });
        const res = mockResponse();
    
        findUserId.mockResolvedValue({ id: '1', name: 'Test User' });
        createNotification.mockResolvedValue(mockNotification); 
        
        await createNotificationUser(req, res);
        
        expect(findUserId).toHaveBeenCalledWith('1');
        expect(createNotification).toHaveBeenCalledWith({
            userId: '1',
            notifType: 'Info',
            title: 'Test Title',
            message: 'Test Message',
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: convertToJson(mockNotification),
        });
    });
    
    
});