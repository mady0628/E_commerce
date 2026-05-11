import Cart from '../module/cart.module.js'
import Order from '../module/order.module.js'
import Product from '../module/product.module.js'

export const createOrder = async (req, res) => {
    try {
        const userID = req.user.id;
        const { selectedItemIds, shippingInfo } = req.body;

        if (!selectedItemIds || !selectedItemIds.length || !shippingInfo) {
            return res.status(400).json({ message: "Missing order information" });
        }

        const cart = await Cart.findOne({ user: userID })
            .populate("products.product");
        if (!cart || !cart.products.length) {
            return res.status(400).json({
                message: "empty cart",
            })
        }

        const selectedProducts = cart.products.filter(item =>
            selectedItemIds.includes(item.product._id.toString())
        );

        if (!selectedProducts.length) {
            return res.status(400).json({ message: "No valid products selected" });
        }

        for (const item of selectedProducts) {
            if (item.product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Not enough stock for ${item.product.name}`
                });
            }
        }

        const total = selectedProducts.reduce((sum, item) => {
            return sum + item.product.cost * item.quantity;
        }, 0)

        const order = await Order.create({
            user: userID,
            products: selectedProducts,
            total: total,
            recipientName: shippingInfo.recipientName,
            phone: shippingInfo.phone,
            address: shippingInfo.address
        })

        for (const item of selectedProducts) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: -item.quantity, purchased: +item.quantity },
            });
        }

        cart.products = cart.products.filter(item =>
            !selectedItemIds.includes(item.product._id.toString())
        );
        await cart.save();
        res.json(order);
    } catch (err) {
        res.status(500).json({
            error: err.message,
        })
    }
}

export const getOrder = async (req, res) => {
    const userID = req.user.id;
    const order = await Order.find({ user: userID })
        .populate("products.product");

    if (!order) {
        return res.status(400).json({
            message: "No order",
        })
    } else {
        res.json(order)
    }
}

export const getAllOrder = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .populate("products.product", "name cost");

        res.json({
            message: "success",
            orders
        });
    } catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'shipping', 'success', 'cancel'].includes(status)) {
            return res.status(400).json({
                message: "Invalid status",
            });
        }

        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        res.json({
            message: "Order status updated",
            order
        });
    } catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
};
