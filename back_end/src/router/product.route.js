import express from 'express';
import { creatProduct, getProduct } from '../controller/product.controller.js';

const router = express.Router();

router.post('/product',creatProduct);
router.get('/product',getProduct);

export default router;