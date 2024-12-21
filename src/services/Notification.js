import { prisma } from "../config/db.js";


const getNotificationUser = async (userId) => {
    return prisma.notification.findMany({
        where: {
            userId: userId,
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

const updateNotification = async (notificationId) => {
    return prisma.notification.update({
        where : {
            id: BigInt(notificationId), 
        },
        data : {
            isRead : true,
            updatedAt : new Date(),
        },
    });
};

const findIdNotification = async (notificationId) => {
    return prisma.notification.findUnique({
        where: {
            id: BigInt(notificationId),
        },
    });
};

const deleteNotification = async (notificationId) => {
    return prisma.notification.delete({
        where: {
            id: BigInt(notificationId),
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