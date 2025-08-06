import mongoose from "mongoose";
import { param, body } from "express-validator";
import { Playlist } from "../models/playlist.models.js";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const validatePlaylistId = [
    param("playlistId")
        .custom((value) => isValidObjectId(value))
        .withMessage("Invalid playlist ID")
        .bail()
        .custom(async (value) => {
            const exists = await Playlist.exists({ _id: value });
            if (!exists) throw new Error("Playlist not found");
        }),
];

const validateVideoId = [
    param("videoId")
        .custom((value) => isValidObjectId(value))
        .withMessage("Invalid video ID")
        .bail()
        .custom(async (value) => {
            const exists = await Video.exists({ _id: value });
            if (!exists) throw new Error("Video not found");
        }),
];

const validateUserId = [
    param("userId")
        .custom((value) => isValidObjectId(value))
        .withMessage("Invalid user ID")
        .bail()
        .custom(async (value) => {
            const exists = await User.exists({ _id: value });
            if (!exists) throw new Error("User not found");
        }),
];

const validateCreatePlaylist = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Playlist name is required")
        .isLength({ min: 3, max: 50 })
        .withMessage("Playlist name must be between 3 and 50 characters"),
    body("description")
        .optional()
        .isLength({ max: 200 })
        .withMessage("Description must be at most 200 characters"),
];

const validateUpdatePlaylist = [
    body("name")
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage("Playlist name must be between 3 and 50 characters"),
    body("description")
        .optional()
        .isLength({ max: 200 })
        .withMessage("Description must be at most 200 characters"),
];

export {
    validatePlaylistId,
    validateVideoId,
    validateUserId,
    validateCreatePlaylist,
    validateUpdatePlaylist,
};
