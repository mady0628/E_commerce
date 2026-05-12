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
        const {q = '', sort = 'newest'} = req.query;
        
        let sortOption = {createAt: -1}; // default newest
        if (sort === 'best_selling') sortOption = {purchased: -1, createAt: -1};
        if (sort === 'price_asc') sortOption = {cost: 1, createAt: -1};
        if (sort === 'price_desc') sortOption = {cost: -1, createAt: -1};

        const rawOffset = Number.parseInt(req.query.productOffset, 10);
        const rawLimit = Number.parseInt(req.query.productLimit, 10);

        const productOffset = Number.isNaN(rawOffset) || rawOffset < 0 ? 0 : rawOffset;
        let productLimit = Number.isNaN(rawLimit) || rawLimit < 0 ? 10 : rawLimit;
        
        if (productLimit > 20) productLimit = 20;
        const filter = q.trim()
            ? {
                $or: [
                    {name: {$regex: q.trim(), $options: 'i'}},
                    {describe: {$regex: q.trim(), $options: 'i'}}
                ]
            }
            : {};
        
        const product = await Product.find(filter)
            .sort(sortOption)
            .skip(productOffset)
            .limit(productLimit);

        const total = await Product.countDocuments(filter);
        const returned = product.length;
        const nextOffset = productOffset + returned;
        const hasMore = nextOffset < total;

        res.json({
            product,
            productPagination:{
                offset: productOffset,
                limit: productLimit,
                returned,
                total,
                nextOffset,
                hasMore
            }
        });
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