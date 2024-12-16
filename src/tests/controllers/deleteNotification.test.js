
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteNotificationUser } from "../../controllers/notificationController.js";
import { mockRequest, mockResponse } from "../../utils/mockHelpers.js";
import { findIdNotification, deleteNotification } from "../../services/Notification.js";

vi.mock("../../services/Notification.js", () => ({
    findIdNotification: vi.fn(),
    deleteNotification: vi.fn(),
}));

describe("Post Notification testing", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return 404 if notificationId does not exist", async () => {
        const req = mockRequest({ params: { id: "1" } });
        const res = mockResponse();

        findIdNotification.mockResolvedValue(null); // Simulasikan notifikasi tidak ditemukan

        await deleteNotificationUser(req, res);

        expect(findIdNotification).toHaveBeenCalledWith(BigInt("1"));
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "NotificationId tidak tersedia."
        });
    });

    
    // it("should return 200 if notification is successfully deleted", async () => {
    //     const req = mockRequest({ params: { id: "1" } });
    //     const res = mockResponse();

    //     findIdNotification.mockResolvedValue({ id: 1 }); // Simulasikan notifikasi ditemukan
    //     deleteNotification.mockResolvedValue({ id: 1 }); // Simulasikan berhasil menghapus notifikasi

    //     await deleteNotificationUser(req, res);

    //     expect(findIdNotification).toHaveBeenCalledWith("1");
    //     expect(deleteNotification).toHaveBeenCalledWith("1");
    //     expect(res.status).toHaveBeenCalledWith(200);
    //     expect(res.json).toHaveBeenCalledWith({
    //         success: true,
    //         message: "Berhasil menghapus notifikasi."
    //     });
    // });
});
