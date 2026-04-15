import bcrypt from 'bcrypt'
import User from '../module/user.module.js';
export const sign_up = async( req, res) =>{
    try {
        const {name, email, password} = req.body;
        const passwordHash = await bcrypt.hashSync(password,10);

        const user = await User.create({
            name,
            email,
            password:passwordHash
        })
        res.json({
            message: "create succes",
            user
        })
    } catch (err) {
        res.status(500).json({
            error: err.message,
        })
    }
}

export const sign_in =  async (req,res) => {
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email});
        
        if (!user){
            return res.status(400).json({
                message: "Email not found",
            })
        }
        const match = await bcrypt.compare(password,user.password);
        if (!match){
            return res.status(400).json({
                message: "Wrong password",
            })
        }
        res.json({
            message: "login success",
            user,
        })
    } catch (err) {
        res.json({
            error: err.message,
        })
    }
}