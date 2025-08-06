import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
});

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // This is ESSENTIAL for video
        });

        fs.unlinkSync(localFilePath); // clean up
        return response;
    } catch (error) {
        console.error("Cloudinary Upload Failed:", error);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
};

const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null;

        const response = await cloudinary.uploader.destroy(publicId);
        console.log("deleted from cloudinary", publicId);
    }
    catch (error) {
        console.log("Error deleting file on cloudinary", error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };