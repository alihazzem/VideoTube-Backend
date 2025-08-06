import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { User } from "../models/user.models.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new apiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Token generation error:", error);
        throw new apiError(500, "Error generating tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new apiError(409, "User already exists");
    }

    //Handle images
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar is required");
    }

    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath);
        console.log("Avatar uploaded", avatar);
    } catch (error) {
        console.log("Error uploading avatar", error);
        throw new apiError(500, "Failed to upload Avatar");
    }

    let coverImage;
    try {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
        console.log("coverImage uploaded", coverImage);
    } catch (error) {
        console.log("Error uploading coverImage", error);
        throw new apiError(500, "Failed to upload coverImage");
    }

    try {
        const user = await User.create({
            fullname,
            email: email.toLowerCase().trim(),  // Normalize email here
            password,
            username: username.toLowerCase(),
            avatar: avatar?.url,
            coverImage: coverImage?.url || ""
        });

        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        if (!createdUser) {
            throw new apiError(500, "Error creating User!!");
        };

        return res.status(201).json(new apiResponse(201, createdUser, "User registered successfully!"));
    } catch (error) {
        console.log("Error creating User", error);

        if (avatar) {
            await deleteFromCloudinary(avatar.public_id);
        }

        if (coverImage) {
            await deleteFromCloudinary(coverImage.public_id);
        }
        throw new apiError(500, "Error creating User and images were deleted!!");
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new apiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new apiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    };

    if (!loggedInUser) {
        throw new apiError(500, "Error logging in User");
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new apiResponse(
            200,
            { user: loggedInUser, accessToken, refreshToken },
            "User logged in successfully!"
        ));
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: undefined }, { new: true });

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new apiResponse(200, {}, "User logged out successfully!"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const oldRefreshToken = req.cookies.refreshToken || req.body.refreshToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!oldRefreshToken) {
        throw new apiError(401, "Refresh token not found");
    }

    try {
        const decodedToken = jwt.verify(
            oldRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        );

        const user = await User.findById(decodedToken.user_id);

        if (!user) {
            throw new apiError(401, "Invalid refresh token");
        }

        if (oldRefreshToken !== user?.refreshToken) {
            throw new apiError(401, "Invalid refresh token");
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        };

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new apiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Tokens updated successfully!"));

    } catch (error) {
        if (
            error.name === "TokenExpiredError" ||
            error.name === "JsonWebTokenError"
        ) {
            throw new apiError(401, "Invalid or expired refresh token");
        }
        throw new apiError(500, "Something went wrong while refreshing tokens");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new apiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordValid) {
        throw new apiError(401, "Old password is incorrect!");
    }

    user.password = newPassword;
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });

    const newRefreshToken = user.generateRefreshToken(user._id);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    return res
        .status(200)
        .json(new apiResponse(200, {}, "Password changed successfully!"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new apiResponse(200, req.user, "User details fetched successfully!"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
        throw new apiError(409, "Email is already in use by another account!");
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { fullname, email } },
        { new: true })
        .select("-password -refreshToken");

    if (!updatedUser) {
        throw new apiError(500, "Failed to update account details!");
    }

    return res
        .status(200)
        .json(new apiResponse(200, updatedUser, "Account details updated successfully!"));
});

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar is required!");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar?.url) {
        throw new apiError(500, "Failed to upload avatar on cloudinary!");
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { avatar: avatar.url } },
        { new: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
        throw new apiError(404, "User not found while updating avatar!");
    }

    return res
        .status(200)
        .json(new apiResponse(200, avatar, "Avatar updated successfully!"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new apiError(400, "Cover image is required!");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage?.url) {
        throw new apiError(500, "Failed to upload cover image on cloudinary!");
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { coverImage: coverImage.url } },
        { new: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
        throw new apiError(404, "User not found while updating cover image!");
    }

    return res
        .status(200)
        .json(new apiResponse(200, coverImage, "cover image updated successfully!"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new apiError(400, "Username is required!");
    }

    const currentUserId = new mongoose.Types.ObjectId(req.user._id);

    const channel = await User.aggregate([
        {
            // First pipeline
            $match: { username: username?.toLowerCase() }
        },
        {
            // Second pipeline
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            // Third pipeline
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            // Fourth pipeline
            $addFields: {
                subscribersCount: { $size: "$subscribers" },
                channelsubscribedToCount: { $size: "$subscribedTo" },
                isSubscribed: {
                    $in: [currentUserId, "$subscribers.subscriber"]
                }
            }
        },
        {
            // Fifth pipeline
            $project: {
                username: 1,
                fullname: 1,
                avatar: 1,
                subscribersCount: 1,
                channelsubscribedToCount: 1,
                isSubscribed: 1,
                coverImage: 1
            }
        }

    ]);

    if (!channel?.length) {
        throw new apiError(404, "Channel not found!");
    }

    return res
        .status(200)
        .json(new apiResponse(200, channel[0], "Channel profile fetched successfully!"));

});

const getWatchHistory = asyncHandler(async (req, res) => {
    const currentId = new mongoose.Types.ObjectId(req.user?._id);
    const user = await User.aggregate([
        {
            // First pipeline
            $match: { _id: currentId }
        },
        {
            // Second pipeline
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $arrayElemAt: ["$owner", 0] }
                        }
                    }
                ]
            }
        }
    ]);

    if (!user?.length) {
        throw new apiError(404, "User not found!");
    }

    return res
        .status(200)
        .json(new apiResponse(200, user[0]?.watchHistory, "Watch history fetched successfully!"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory
}