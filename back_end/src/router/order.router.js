import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { createOrder, getOrder, getAllOrder, updateOrderStatus } from '../controller/order.controller.js';
import { requireAdmin } from '../middleware/requireAdmin.middleware.js';

const route = express.Router();

route.post('/order', authMiddleware, createOrder)
route.get('/order', authMiddleware, getOrder)
route.get('/orders', authMiddleware, requireAdmin, getAllOrder)
route.patch('/orders/:id/status', authMiddleware, requireAdmin, updateOrderStatus)

export default route;