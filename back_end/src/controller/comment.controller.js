import Product from "../module/product.module.js"
import Comment from "../module/comment.module.js"

export const getProductDetailWithComments = async (req, res) => {
    try {
        const { id } = req.params;

        const rawOffset = Number.parseInt(req.query.commentOffset, 10);
        const rawLimit = Number.parseInt(req.query.commentLimit, 10);

        const commentOffset = Number.isNaN(rawOffset) || rawOffset < 0 ? 0 : rawOffset;
        let commentLimit = Number.isNaN(rawLimit) || rawLimit < 0 ? 5 : rawLimit;
        if (commentLimit > 20) commentLimit = 20;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const commentFilter = {
            product: id,
            isHidden: false,
        };

        const comment = await Comment.find(commentFilter)
            .populate("user", "name")
            .sort({ createAt: -1 })
            .skip(commentOffset)
            .limit(commentLimit);

        const total = await Comment.countDocuments(commentFilter);
        const returned = comment.length;
        const nextOffset = commentOffset + returned;
        const hasMore = nextOffset < total;

        res.json({
            product,
            comment,
            commentPagination: {
                offset: commentOffset,
                limit: commentLimit,
                returned,
                total,
                nextOffset,
                hasMore,
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const createComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, rating } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const comment = await Comment.create({
            user: req.user._id,
            product: id,
            content: content || '',
            rating,
        });

        const populated = await Comment.findById(comment._id).populate("user", "name");

        res.status(201).json({ comment: populated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const AdminGetAllComment = async(req,res)=>{
    try {
        const {id} = req.params;
        const comment = await Comment.find({product: id,}).populate('user', 'name email').sort({ createAt: -1 });
        if (!comment){
            return res.status(404).json({
                error: "Not found comment;"
            })
        }
        res.json({
            comment,
        })
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}
export const AdminUpdateCommentStatus = async(req,res)=>{
    try{
        const {id} = req.params;
        const {status} = req.body;
        const hidden = status==="Hidden";
        const comment = await Comment.findByIdAndUpdate(
            id,
            { isHidden: hidden },
            { new : true },
        )
        if (!comment){
            return res.status(404).json({
                error: "Not found comment;"
            })
        }
        res.json({
            message: "Update success",
            comment,
        })
    } catch(err){
        res.status(500).json({error:err.message});
    }
}