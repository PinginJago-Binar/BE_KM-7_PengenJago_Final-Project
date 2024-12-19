import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
    getNotificationUser, 
    createNotification,
    findIdNotification,
    deleteNotification,
    updateNotification,
    findUserId
} from "../../services/Notification.js";
import { PrismaClient } from "@prisma/client";

vi.mock("@prisma/client", () => {
    const mockPrismaClient = {
        notification: {
            findMany: vi.fn(),
            create: vi.fn(),
            delete: vi.fn(),
            update: vi.fn(),
            findUnique: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
        }
    };
    return { PrismaClient: vi.fn(() => mockPrismaClient) };
});

const prisma = new PrismaClient();

describe("Testing Service Notification", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Mengembalikan data notifikasi berdasarkan userId", async() => {
        const mockUserId = 1
        const mockData= [{
            id: 1,
            userId : mockUserId,
            notifType : "Promosi test",
            title: "testing",
            message: "hai",
            isRead: false,
            createdAt: "2024-12-10T07:55:01.227Z",
            updateAt: null
        }];

        prisma.notification.findMany.mockResolvedValue(mockData);
        const result = await getNotificationUser(mockData);

        expect(prisma.notification.findMany).toHaveBeenCalledOnce();
        expect(prisma.notification.findMany).toHaveBeenCalledWith({
            where: {
                userId: [{
                    id: 1,
                    userId: 1, 
                    notifType: "Promosi test",
                    title: "testing",
                    message: "hai",
                    isRead: false,
                    createdAt: "2024-12-10T07:55:01.227Z",
                    updateAt: null,
                }]
            },
        });
        expect(result).toEqual(mockData);
    });

    it("Meng-Create notification",async () => {
        const mockData= { 
            userId: BigInt(1),
            notifType: 'test',
            title: 'test',
            message: 'test'
        };
        const mockRespone = { id: 1, ...mockData };

        prisma.notification.create.mockResolvedValue(mockRespone);

        const result = await createNotification(mockData);

        expect(prisma.notification.create).toHaveBeenCalledOnce();
        expect(prisma.notification.create).toHaveBeenCalledWith({ data: mockData});
        expect(result).toEqual(mockRespone);
    });

    it("Mencari User Id Tersedia Atau Tidak", async () => {
        const mockUserId = '1';
        const mockUser = { id: BigInt(mockUserId), name: 'john dow' };

        prisma.user.findUnique.mockResolvedValue(mockUser);

        const result = await findUserId(mockUserId);

        expect(prisma.user.findUnique).toHaveBeenCalledOnce();
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: BigInt(mockUserId) },
        });
        expect(result).toEqual(mockUser);
    });

    it("Update Notification", async () => {
        const mockNotifId = '1';
        const mockUpdateNotif = {
            id: BigInt(mockNotifId),
            isRead: true,
            updateAt: new Date()
        };

        prisma.notification.update.mockResolvedValue(mockUpdateNotif);

        const result = await updateNotification(mockNotifId);

        expect(prisma.notification.update).toHaveBeenCalledOnce();
        expect(prisma.notification.update).toHaveBeenCalledWith({
            where: { id: BigInt(mockNotifId) },
            data: { isRead: true, updatedAt: expect.any(Date) },
        });
        expect(result).toEqual(mockUpdateNotif)
    });

    it("Mencari Notification Id", async () => {
        const mockNotificationId = '1';
        const mockNotification = { id: BigInt(mockNotificationId), notifType: 'info' };
        
        prisma.notification.findUnique.mockResolvedValue(mockNotification);
        
        const result = await findIdNotification(mockNotificationId);
        
        expect(prisma.notification.findUnique).toHaveBeenCalledOnce();
        expect(prisma.notification.findUnique).toHaveBeenCalledWith({
            where: { id: BigInt(mockNotificationId) },
        });
        expect(result).toEqual(mockNotification);
    });

    it("Menghapus Data Notifikasi Menggunakan Id Notifikasi", async () => {
        const mockNotificationId = '1';
        const mockDeletedNotification = { id: BigInt(mockNotificationId), notifType: 'info' };
        
        prisma.notification.delete.mockResolvedValue(mockDeletedNotification);
        
        const result = await deleteNotification(mockNotificationId);
        
        expect(prisma.notification.delete).toHaveBeenCalledOnce();
        expect(prisma.notification.delete).toHaveBeenCalledWith({
            where: { id: BigInt(mockNotificationId) },
        });
        expect(result).toEqual(mockDeletedNotification);
    });
});