import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getNotificationByUserId } from '../../../controllers/notificationController.js';
import { getNotificationUser } from '../../../services/Notification.js';
import { mockRequest, mockResponse } from '../../../utils/mockHelpers.js';
import convertToJson from '../../../utils/convertToJson.js';

vi.mock('../../../services/Notification.js');

describe('getHistoryController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Mengembalikan data notification dan return 200", async () => {
        const req = mockRequest({ params: { userId: "1" } });
        const res = mockResponse();

        const mockNotifications = [
            {
                id: BigInt(1),
                userId: BigInt(1),
                notifType: "Promosi",
                title: "Diskon Spesial!",
                message: "Dapatkan diskon 50% untuk penerbangan tertentu.",
                isRead: false,
                createdAt: new Date("2024-12-10T10:00:00Z"),
                updatedAt: null,
            },
        ];
        
        getNotificationUser.mockResolvedValueOnce(mockNotifications);
        
        await getNotificationByUserId(req, res);
        
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: convertToJson(mockNotifications), 
        });
    });

    it("Return 400 jika tidak ada transaksi", async () => {
        const req = mockRequest({ params: { userId: "1" } });
        const res = mockResponse();
        
        getNotificationUser.mockResolvedValueOnce([]);
        
        await getNotificationByUserId(req, res);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Anda belum memiliki riwayat notifikasi.",
        });
    });
});