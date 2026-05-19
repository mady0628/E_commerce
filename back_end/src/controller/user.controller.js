import bcrypt from 'bcrypt';
import User from '../module/user.module.js';
import jwt from 'jsonwebtoken';
import { uploadImageToCloudinary } from '../utils/cloudinary.js';

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
        if (!process.env.JWT_PASS) {
            return res.status(500).json({
                message: "JWT_PASS is not configured",
            });
        }

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

export const updateShippingInfo = async (req, res) => {
    try {
        const { nameInOrder, phoneNumber, address } = req.body;

        const shippingInfo = {
            nameInOrder: nameInOrder?.trim(),
            phoneNumber: phoneNumber?.trim(),
            address: address?.trim(),
        };

        if (!shippingInfo.nameInOrder || !shippingInfo.phoneNumber || !shippingInfo.address) {
            return res.status(400).json({
                message: "Please fill in all shipping details",
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            shippingInfo,
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.json({
            message: "Shipping info saved",
            user,
        });
    } catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
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

export const changepassword = async (req, res) =>{
    try {
        const id = req.user.id;
        const {currentPassword, newPassword} = req.body;
        if (!currentPassword || !newPassword){
            return res.json({
                message: "Please fill full information",
            })
        }
        const user = await User.findById(id);
        const match = await bcrypt.compare(currentPassword,user.password);
        if (!match){
            return res.json({
                message: "Current password is wrong",
            })
        }
        user.password = await bcrypt.hashSync(newPassword,10);
        await user.save();
        res.json({
            message: "Change password success",
        })
    } catch (err) {
        res.json({
            error: err.message,
        })
    }
}

export const updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload an avatar",
            })
        }

        const avatarUrl = await uploadImageToCloudinary(
            req.file,
            'new_ecommerce/avatars'
        );

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { avatar: avatarUrl },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            })
        }

        res.json({
            message: "Avatar updated",
            user,
        })
    } catch (err) {
        res.status(500).json({
            error: err.message,
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
        const checkroleadmin = await User.findById(id);
        if (!checkroleadmin) {
            return res.status(404).json({
                message: "Can't find User",
            })
        }
        if (checkroleadmin.role === 'admin'){
            return res.json({
                message: "This account is admin. Cannot be delete"
            })
        }
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
