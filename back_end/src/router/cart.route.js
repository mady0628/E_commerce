import express from 'express'
import { addToCart, getCart } from '../controller/cart.controller.js';

const route = express.Router();

route.post('/cart',addToCart);
route.get('/cart',getCart)

export default route;