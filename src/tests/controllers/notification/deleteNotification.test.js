
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteNotificationUser } from "../../../controllers/notificationController.js";
import { mockRequest, mockResponse } from "../../../utils/mockHelpers.js";
import { findIdNotification, deleteNotification } from "../../../services/Notification.js";
import asyncWrapper from '../../../utils/asyncWrapper.js';


vi.mock("../../../services/Notification.js", () => ({
    findIdNotification: vi.fn(),
    deleteNotification: vi.fn(),
}));

vi.mock("../../../utils/asyncWrapper.js", () => {
    return {
      default: (fn) => fn,
    };
  });
  
describe("Post Notification testing", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("harus return 404 jika notificationId tidak ditemukan", async () => {
        const req = mockRequest({ params: { id: "1" } });
        const res = mockResponse();

        findIdNotification.mockResolvedValue(null); 

        await deleteNotificationUser(req, res);

        expect(findIdNotification).toHaveBeenCalledWith(BigInt("1"));
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "NotificationId tidak tersedia."
        });
    });
    
    it("harus return 200 jika notification berhasil dihapus", async () => {
        const req = mockRequest({params: { id: "1" } }); 
        const res = mockResponse();
        const mockNotification = { id: BigInt(1) };
        
        findIdNotification.mockResolvedValue(mockNotification);
        deleteNotification.mockResolvedValue(mockNotification);
        
        await deleteNotificationUser(req, res);
        
        expect(findIdNotification).toHaveBeenCalledWith(BigInt(1));
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Berhasil menghapus notifikasi.",
        });
    });
});