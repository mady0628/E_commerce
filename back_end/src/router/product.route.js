import express from 'express';
import { creatProduct, getProduct, deleteProduct, updateProduct } from '../controller/product.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/requireAdmin.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

router.post('/product', authMiddleware, requireAdmin, upload.array('images', 5), creatProduct);
router.get('/product', getProduct);
router.delete('/product/:id', authMiddleware, requireAdmin, deleteProduct);
router.patch('/product/:id', authMiddleware, requireAdmin, upload.array('images', 5), updateProduct);

export default router;
