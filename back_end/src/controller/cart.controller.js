import Cart from "../module/cart.module.js";

export const addToCart = async(req,res) =>{
    const userID = req.user.id;
    const {productID} = req.body;
    
    let cart = await Cart.findOne({user: userID});
    if (!cart){
        cart = await Cart.create({
            user: userID,
            products: []
        })
    }
    const exist = cart.products.find(
        item => item.product.toString === productID
    )
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