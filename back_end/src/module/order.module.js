import mongoose from 'mongoose'

var orderModule = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
            quantity: Number,
        }
    ],
    total: {
        type: Number,
    },
    status: {
        type: String,
        default: "pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    recipientName: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    }
})

export default mongoose.model('Order', orderModule);