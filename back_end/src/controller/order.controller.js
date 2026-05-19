import Cart from '../module/cart.module.js'
import Order from '../module/order.module.js'
import Product from '../module/product.module.js'
import User from "../module/user.module.js"

export const createOrder = async (req, res) => {
    try {
        const userID = req.user.id;
        const { selectedItemIds, shippingInfo } = req.body;

        if (!selectedItemIds || !selectedItemIds.length || !shippingInfo) {
            return res.status(400).json({ message: "Missing order information" });
        }

        const cleanShippingInfo = {
            recipientName: shippingInfo.recipientName?.trim(),
            phone: shippingInfo.phone?.trim(),
            address: shippingInfo.address?.trim(),
        };

        if (!cleanShippingInfo.recipientName || !cleanShippingInfo.phone || !cleanShippingInfo.address) {
            return res.status(400).json({ message: "Please fill in all shipping details" });
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
            recipientName: cleanShippingInfo.recipientName,
            phone: cleanShippingInfo.phone,
            address: cleanShippingInfo.address
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
        .sort({ createdAt: -1 })
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
        const { q = '' } = req.query;
        const searchTerm = q.trim();
        let rawOrders;

        if (searchTerm) {
            const users = await User.find({ name: { $regex: searchTerm, $options: 'i' } });
            const userIDs = users.map(user => user._id);

            rawOrders = await Order.aggregate([
                {
                    $addFields: {
                        idString: { $toString: "$_id" },
                        dateString: { 
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "+07:00" } 
                        },
                        dateStringVN: {
                            $dateToString: { format: "%d/%m/%Y", date: "$createdAt", timezone: "+07:00" } 
                        }
                    }
                },
                {
                    $match: {
                        $or: [
                            { user: { $in: userIDs } },
                            { idString: { $regex: searchTerm, $options: 'i' } },
                            { recipientName: { $regex: searchTerm, $options: 'i' } },
                            { phone: { $regex: searchTerm, $options: 'i' } },
                            { address: { $regex: searchTerm, $options: 'i' } },
                            { dateString: { $regex: searchTerm, $options: 'i' } },
                            { dateStringVN: { $regex: searchTerm, $options: 'i' } }
                        ]
                    }
                }
            ]);
        } else {
            rawOrders = await Order.find({});
        }

        const orders = await Order.populate(rawOrders, [
            { path: "user", select: "name email" },
            { path: "products.product", select: "name cost" }
        ]);

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
