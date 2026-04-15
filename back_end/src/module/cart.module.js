import mongoose from "mongoose";

var cartModule = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    products:[
        {
            product:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
            quantity:{
                type: Number,
                default: 0,
            }
        }
    ]
})

export default mongoose.model('Cart',cartModule);