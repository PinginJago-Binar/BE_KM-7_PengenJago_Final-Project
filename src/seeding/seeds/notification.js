import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const seedNotification = async () => {
    const notification = [
        {
            userId : 1,
            notifType : "Promosi",
            title : "Testing",
            message : "Berhasil",
        },
        {
            userId : 2,
            notifType : "Notifikasi",
            title : "Testing",
            message : "Lalalala",
        },
    ];
    await prisma.notification.createMany({ data : notification });
    console.log('Notification seeded!');
};

export default seedNotification;