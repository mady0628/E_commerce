import express from 'express';
import { me, sign_in, sign_up, updateRole, getAllUsers, deleteUser, updateShippingInfo, changepassword, updateAvatar } from '../controller/user.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/requireAdmin.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const route = express.Router();

route.post('/sign_up', sign_up);
route.post('/sign_in', sign_in);
route.get('/me', authMiddleware, me);
route.patch('/me/shipping-info', authMiddleware, updateShippingInfo);
route.patch('/me/avatar', authMiddleware, upload.single('avatar'), updateAvatar);
route.get('/users', authMiddleware, requireAdmin, getAllUsers);

route.patch('/me/password', authMiddleware, changepassword)
route.patch('/users/:id/role', authMiddleware, requireAdmin, updateRole);
route.delete('/users/:id', authMiddleware, requireAdmin, deleteUser);

export default route;
