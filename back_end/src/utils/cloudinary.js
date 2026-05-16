import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

const configureCloudinary = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });
};

export const uploadImageToCloudinary = (file, folder = process.env.CLOUDINARY_FOLDER || 'new_ecommerce') => {
    if (!file?.buffer) {
        return Promise.reject(new Error('Invalid upload file'));
    }

    configureCloudinary();

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(result.secure_url);
            }
        );

        Readable.from(file.buffer).pipe(uploadStream);
    });
};

export const uploadImagesToCloudinary = async (files = [], folder) => {
    return Promise.all(files.map(file => uploadImageToCloudinary(file, folder)));
};
