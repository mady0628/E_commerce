export const requireAdmin = async (req, res, next) =>{
    if (req.user.role !== 'admin'){
        return res.status(403).json({message: "Not admin"})
    }
    next();
}