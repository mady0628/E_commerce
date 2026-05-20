import Cart from "../module/cart.module.js";
import Product from "../module/product.module.js";

export const addToCart = async(req,res) =>{
    const userID = req.user.id;
    const {productID} = req.body;
    
    const product = await Product.findById(productID);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({user: userID});
    if (!cart){
        cart = await Cart.create({
            user: userID,
            products: []
        })
    }
    const exist = cart.products.find(
        item => item.product.toString() === productID
    )
    
    const currentQuantity = exist ? exist.quantity : 0;
    if (currentQuantity + 1 > product.stock) {
        return res.status(400).json({ message: "Not enough stock available" });
    }

    if (exist){
        exist.quantity +=1;
    } else {
        cart.products.push({
            product: productID,
            quantity: 1,
        })
    }

    await cart.save();
    await cart.populate("products.product");
    res.json(cart)
}

export const getCart = async(req,res) =>{
    const userId = req.user.id;
    const cart = await Cart.findOne({user: userId}).populate("products.product");
    if (!cart) return res.json({
        user: userId,
        products: []
    })
    res.json(cart)
}

export const updateCartItem = async(req, res) => {
    const userID = req.user.id;
    const { productID, quantity } = req.body;

    let cart = await Cart.findOne({user: userID});
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const exist = cart.products.find(
        item => item.product.toString() === productID
    );

    if (!exist) return res.status(404).json({ message: "Product not in cart" });

    if (quantity <= 0) {
        cart.products = cart.products.filter(item => item.product.toString() !== productID);
    } else {
        const product = await Product.findById(productID);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (quantity > product.stock) {
            return res.status(400).json({ message: "Not enough stock available" });
        }
        exist.quantity = quantity;
    }

    await cart.save();
    await cart.populate("products.product");
    res.json(cart);
}
