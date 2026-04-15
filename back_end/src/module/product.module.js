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
    }
})

export default mongoose.model('Product',productModule);