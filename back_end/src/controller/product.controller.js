import Product from '../module/product.module.js'

export const creatProduct = async (req,res) =>{
    try {
        const {name,cost} = req.body;

        const product = await Product.create({
            name,
            cost
        })
        res.json({
            message: "created success",
            product,
        })
    } catch (err) {
        res.status(500).json({
            error: err.message,
        })
    }
}

export const getProduct = async (req,res) => {
    const product = await Product.find()
    res.json({
        product
    })
}