import jwt from 'jsonwebtoken';
import User from '../module/user.module.js';

export const authMiddleware = async (req,res,next) =>{
    try {
        if (!process.env.JWT_PASS) {
            return res.status(500).json({
                message: "JWT_PASS is not configured",
            });
        }

        const authHeader = req.headers.authorization;
        if (!authHeader){
            return res.status(400).json({
                message:"no token"
            })
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token,process.env.JWT_PASS);
        
        const user = await User.findById(decoded.id).select("_id role email name nameInOrder phoneNumber address avatar");
        if (!user) {
            return res.status(401).json({
                message:"user not found",
            });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "invalid token",
        })
    }
}
