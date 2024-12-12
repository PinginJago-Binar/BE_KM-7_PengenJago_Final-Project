import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getNotificationUser = async (userId) => {
    return prisma.notification.findMany({
        where: {
            userId: BigInt(userId),
        },
    });
};

const createNotification = async (data) => {
    const { userId, notifType, title, message }= data;
    return prisma.notification.create({
        data: { userId, notifType, title, message },    
    });
};

const findUserId = async (userId) => {
    return prisma.user.findUnique({
        where: {
            id: BigInt(userId),
        },
    });
};

const updateNotification = async (id) => {
    return prisma.notification.update({
        where : {
            id: BigInt(id), 
        },
        data : {
            isRead : true,
            updatedAt : new Date(),
        },
    });
};

const findIdNotification = async (id) => {
    return prisma.notification.findUnique({
        where: {
            id: BigInt(id),
        },
    });
};

const deleteNotification = async (id) => {
    return prisma.notification.delete({
        where: {
            id: BigInt(id),
        },
    });
};

export{
    getNotificationUser,
    createNotification,
    updateNotification,
    deleteNotification,
    findUserId,
    findIdNotification
}