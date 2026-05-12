import mongoose from "mongoose";

var productModule = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    cost:{
        type: Number,
        required: true,
    },
    describe:{
        type: String,
    },
    image: {
        type: String,
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    purchased:{
        type: Number,
        default:0,
    },
    createAt:{
        type: Date,
        default: Date.now,
    }
})

export default mongoose.model('Product',productModule);