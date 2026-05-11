import express from 'express';
import { getProductDetailWithComments, createComment, AdminGetAllComment, AdminUpdateCommentStatus } from '../controller/comment.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/requireAdmin.middleware.js';
const router = express.Router();

router.get('/product/:id', getProductDetailWithComments);

router.post('/product/:id/comment', authMiddleware, createComment);

router.get('/admin/product/:id/comments',authMiddleware,requireAdmin,AdminGetAllComment);

router.patch('/admin/comments/:id/visibility',authMiddleware,requireAdmin,AdminUpdateCommentStatus);
export default router;