import express from 'express';
import morgan from 'morgan';
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

import auth from './router/user.route.js'
import product from './router/product.route.js'
import cart from './router/cart.route.js'
import order from './router/order.router.js'
import comment from './router/comment.router.js'

dotenv.config();
const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());
app.use('/uploads', express.static('public/uploads'));

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("connect success");
    })
    .catch((err) => {
        console.log(err);
    })

app.get('/', (req, res) => {
    res.send("Server is running..");
})

app.use('/api/auth', auth);
app.use('/api', product);
app.use('/api', cart);
app.use('/api', order);
app.use('/api', comment);

const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})
