import express from 'express';
import { sign_in, sign_up } from '../controller/user.controller.js';

const route = express.Router()

route.post('/sign_up',sign_up)
route.post('/sign_in',sign_in)

export default route;