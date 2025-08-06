import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw new apiError(401, "Unauthorized request!");

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken.user_id).select("-password -refreshToken");

        if (!user) throw new apiError(401, "Unauthorized request!");

        req.user = user;

        next();
    } catch (error) {
        throw new apiError(401, "Invalid access token!");
    }
});
