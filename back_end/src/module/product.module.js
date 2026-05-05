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
    }
})

export default mongoose.model('Product',productModule);