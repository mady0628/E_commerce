import Product from '../module/product.module.js'
import { uploadImagesToCloudinary } from '../utils/cloudinary.js';

export const creatProduct = async (req, res) => {
    try {
        const { name, cost, describe, stock } = req.body;

        const imageUrls = (req.files && req.files.length > 0)
            ? await uploadImagesToCloudinary(req.files, 'new_ecommerce/products')
            : [];

        const product = await Product.create({
            name,
            cost,
            describe,
            stock: stock ? parseInt(stock) : 0,
            image: imageUrls,
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


export const getProduct = async (req, res) => {
    try {
        const { q = '', sort = 'newest' } = req.query;

        let sortOption = { createAt: -1 }; // default newest
        if (sort === 'best_selling') sortOption = { purchased: -1, createAt: -1 };
        if (sort === 'price_asc') sortOption = { cost: 1, createAt: -1 };
        if (sort === 'price_desc') sortOption = { cost: -1, createAt: -1 };

        const rawOffset = Number.parseInt(req.query.productOffset, 10);
        const rawLimit = Number.parseInt(req.query.productLimit, 10);

        const productOffset = Number.isNaN(rawOffset) || rawOffset < 0 ? 0 : rawOffset;
        let productLimit = Number.isNaN(rawLimit) || rawLimit < 0 ? 10 : rawLimit;

        if (productLimit > 20) productLimit = 20;
        const filter = q.trim()
            ? {
                $or: [
                    { name: { $regex: q.trim(), $options: 'i' } },
                    { describe: { $regex: q.trim(), $options: 'i' } }
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
            productPagination: {
                offset: productOffset,
                limit: productLimit,
                returned,
                total,
                nextOffset,
                hasMore
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
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

        // Ảnh cũ muốn giữ lại (frontend gửi lên dạng JSON string)
        let keepImages = [];
        if (req.body.keepImages) {
            try { keepImages = JSON.parse(req.body.keepImages); } catch { keepImages = []; }
        }

        // Ảnh mới vừa upload
        let newImages = [];
        if (req.files && req.files.length > 0) {
            newImages = await uploadImagesToCloudinary(req.files, 'new_ecommerce/products');
        }

        const updateData = { name, cost, describe };
        if (stock !== undefined) {
            updateData.stock = parseInt(stock);
        }
        // Chỉ cập nhật image khi client có gửi keepImages hoặc có file mới
        if (req.body.keepImages !== undefined || newImages.length > 0) {
            updateData.image = [...keepImages, ...newImages];
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
