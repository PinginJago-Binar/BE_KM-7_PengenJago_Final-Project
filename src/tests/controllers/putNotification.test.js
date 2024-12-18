import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRequest, mockResponse } from '../../utils/mockHelpers.js';
import { updateNotificationUser } from '../../controllers/notificationController.js';
import { updateNotification, findIdNotification } from '../../services/Notification.js';
import convertToJson from '../../utils/convertToJson.js';
import { PrismaClient } from "@prisma/client";

vi.mock("@prisma/client", () => {
  const mockPrisma = {
    notification: {
      create: vi.fn(),
    },
  };
  return { PrismaClient: vi.fn(() => mockPrisma) };
});

const prisma = new PrismaClient();

vi.mock("../../services/Notification.js", () => ({
    findIdNotification: vi.fn(),
    updateNotification: vi.fn(),
}));

vi.mock('../../utils/convertToJson.js', () => ({
  default: vi.fn(),
}));

describe("Update Notification User Controller", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it("should return 404 if notificationId does not exist", async () => {
    const req = mockRequest({
      params: { id: "1" },
    });
    const res = mockResponse();
    
    findIdNotification.mockResolvedValueOnce(null);
    
    await updateNotificationUser(req, res);
    
    expect(findIdNotification).toHaveBeenCalledWith(BigInt("1"));
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "NotificationId tidak tersedia.",
    });
  });
  
  // it("should return 200 and the updated notification if successful", async () => {
  //   const mockNotification = {
  //     id: 1n,
  //     userId: 1,
  //     notifType: 'Promosi',
  //     title: 'Update Title',
  //     message: 'Updated notification',
  //     createdAt: '2024-12-14T13:03:37.515Z',
  //     isRead: true,
  //     updatedAt: '2024-12-14T13:03:37.515Z',
  //   };
        
  //   const req = mockRequest({
  //     params: { id: "1" },
  //   });
  //   const res = mockResponse();
    
  //   findIdNotification.mockResolvedValue(mockNotification);
  //   updateNotification.mockResolvedValue(mockNotification);
  //   convertToJson.mockReturnValue(mockNotification);
    
  //   await updateNotificationUser(req, res);
    
  //   console.log("res.status.mock.calls:", res.status.mock.calls);
  //   console.log("res.json.mock.calls:", res.json.mock.calls);
    
  //   expect(res.status).toHaveBeenCalledWith(200);
  //   expect(res.json).toHaveBeenCalledWith({
  //     success: true,
  //     data: mockNotification,
  //   });
  // });  
});