import bcrypt from 'bcrypt';
import User from '../module/user.module.js';
import jwt from 'jsonwebtoken';

export const sign_up = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const passwordHash = await bcrypt.hashSync(password, 10);

        const user = await User.create({
            name,
            email,
            password: passwordHash
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

export const sign_in = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Email not found",
            })
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({
                message: "Wrong password",
            })
        }
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_PASS,
            { expiresIn: '1d' }
        );
        const userSafe = user.toObject();
        delete userSafe.password;
        res.json({
            message: "login success",
            token,
            user: userSafe
        })
    } catch (err) {
        res.json({
            error: err.message,
        })
    }
}

export const me = async (req, res) => {
    res.json({ user: req.user });
}

export const getAllUsers = async (req, res) => {
    try {
        const { q = '' } = req.query;
        const searchTerm = q.trim();

        const filter = searchTerm ? {
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } }
            ]
        } : {};

        const users = await User.find(filter).select('-password');
        res.json({
            message: "success",
            users
        })
    } catch (err) {
        res.status(500).json({
            error: err.message
        })
    }
}
export const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                message: "Role must be user or admin",
            })
        }

        const updateUser = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true },
        ).select('-password');
        if (!updateUser) {
            return res.status(404).json({
                message: "Can't find User",
            })
        }
        res.json({
            message: "Update finish",
            user: updateUser,
        })
    } catch (err) {
        res.status(500).json({
            error: err.message
        })
    }
}

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({
                message: "Can't find User",
            })
        }
        res.json({
            message: "Delete success",
        })
    } catch (err) {
        res.status(500).json({
            error: err.message
        })
    }
}