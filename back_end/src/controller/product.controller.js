import Product from '../module/product.module.js'

export const creatProduct = async (req,res) =>{
    try {
        const {name,cost,describe,stock} = req.body;
        
        let imageUrl = '';
        if (req.file) {
            imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
        } else if (req.body.image) {
            imageUrl = req.body.image;
        }

        const product = await Product.create({
            name,
            cost,
            describe,
            stock: stock ? parseInt(stock) : 0,
            image: imageUrl,
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
    try {
        const {q = ''} = req.query;

        const filter = q.trim()
            ?{
                $or: [
                    {name: {$regex: q.trim(),$options: 'i'}},
                    {describe: {$regex: q.trim(),$options: 'i'}}
                ],
            }
            :{}
        
        const product = await Product.find(filter);

        res.json({product})
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json({ message: "Delete success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, cost, describe, stock } = req.body;
        
        let imageUrl = undefined;
        if (req.file) {
            imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
        } else if (req.body.image) {
            imageUrl = req.body.image;
        }

        const updateData = { name, cost, describe };
        if (stock !== undefined) {
            updateData.stock = parseInt(stock);
        }
        if (imageUrl !== undefined) {
            updateData.image = imageUrl;
        }

        const product = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Update success", product });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}