import express from "express";
import { 
    getNotificationByUserId,
    createNotificationUser,
    updateNotificationUser,
    deleteNotificationUser,
} from '../controllers/notificationController.js';
import { isAuthenticate } from '../middlewares/auth.js';

const notificationRouter = new express.Router();

notificationRouter.get('/:userId',isAuthenticate, getNotificationByUserId);
notificationRouter.post('/', createNotificationUser);
notificationRouter.put('/:id',isAuthenticate, updateNotificationUser);
notificationRouter.delete('/:id',isAuthenticate, deleteNotificationUser);


export default notificationRouter;