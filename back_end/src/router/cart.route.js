import express from 'express'
import { addToCart, getCart, updateCartItem } from '../controller/cart.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const route = express.Router();

route.post('/cart',authMiddleware,addToCart);
route.get('/cart',authMiddleware,getCart);
route.patch('/cart/item', authMiddleware, updateCartItem);

export default route;