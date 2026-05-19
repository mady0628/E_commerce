import mongoose from "mongoose";

var userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
    },
    nameInOrder:{
        type: String,
    },
    phoneNumber:{
        type: String,
    },
    address:{
        type: String,
    },
    role:{
        type: String,
        enum: ['user','admin'],
        default: 'user',
    },
    avatar:{
        type: String,
    }
})
export default mongoose.model('User',userSchema);