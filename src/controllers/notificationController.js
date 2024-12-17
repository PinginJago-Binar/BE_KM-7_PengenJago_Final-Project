import { 
    getNotificationUser,
    createNotification, 
    updateNotification, 
    deleteNotification,
    findUserId,
    findIdNotification
} from "../services/Notification.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import convertToJson from "../utils/convertToJson.js";

const getNotificationByUserId = asyncWrapper( async (req, res) => {

    const { userId } = req.params;
    
    const notification = await getNotificationUser(userId);

    if (!notification || notification.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Anda belum memiliki riwayat notifikasi.",
        });
    }
    return res.status(200).json({
        success: true,
        data: convertToJson(notification),
    });
});

const createNotificationUser = asyncWrapper( async (req, res) => {
    const { userId, notifType, title, message } = req.body;
    if(!userId || !notifType || !title || !message ){
        return res.status(400).json({
            success: false,
            message: "userId, notifType, title, message dibutuhkan."
        });
    }
    const user = await findUserId(userId)
    if (!user){
        return res.status(404).json({
            success: false,
            message: "userId tidak ada."
        });
    }
    const notification = await createNotification({
        userId, 
        notifType, 
        title, 
        message,
    });

    return res.status(200).json({
        success: true,
        data: convertToJson(notification),
    });
});

const updateNotificationUser = asyncWrapper (async (req, res) => {
    const { id } = req.params;
    const notificationId = BigInt(id);
    const idNotification = await findIdNotification(notificationId);
    if (!idNotification){
        return res.status(404).json({
            success: false,
            message: 'NotificationId tidak tersedia.'
        });
    }
    const notification = await updateNotification(notificationId);
    
    return res.status(200).json({
        success: true,
        data: convertToJson(notification),
    });
});

const deleteNotificationUser = asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const notificationId = BigInt(id);
    const idNotification = await findIdNotification(notificationId);
    if (!idNotification){
        return res.status(404).json({
            success: false,
            message: 'NotificationId tidak tersedia.'
        })
    }
    
    return res.status(200).json({
        success: true,
        message: "Berhasil menghapus notifikasi.",
    });
});

export{
    getNotificationByUserId,
    createNotificationUser,
    updateNotificationUser,
    deleteNotificationUser,
}
