import express from 'express';
import morgan from 'morgan';
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

import auth from './router/user.route.js'
import product from './router/product.route.js'
import cart from './router/cart.route.js'

dotenv.config();
const app = express();

//middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

//mongoose

mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log("connect success");
})
.catch((err)=>{
    console.log(err);
})

//test api
app.get('/',(req,res)=>{
    res.send("Server is running..");
})

// temporary test middleware for cart APIs
app.use((req, res, next) => {
    req.user = { id: "69dfba78f69e4a1117e8fad6" };
    next();
})

//router
app.use('/api/auth',auth);
app.use('/api',product);
app.use('/api',cart)

// connect sv
const PORT=3000
app.listen(PORT,()=>{
    console.log(`Server running at http://localhost:${PORT}`)
})
