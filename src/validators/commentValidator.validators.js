import { body, param } from "express-validator";
import mongoose from "mongoose";

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const addCommentValidator = [
    param("videoId")
        .custom(isValidObjectId)
        .withMessage("Invalid video ID"),

    body("content")
        .trim()
        .notEmpty()
        .withMessage("Content is required")
        .isLength({ min: 1 })
        .withMessage("Content must be at least 1 character"),
];

const updateCommentValidator = [
    param("commentId")
        .custom(isValidObjectId)
        .withMessage("Invalid comment ID"),

    body("content")
        .trim()
        .notEmpty()
        .withMessage("Content is required")
        .isLength({ min: 1 })
        .withMessage("Content must be at least 1 character"),
];

const validateCommentId = [
    param("commentId")
        .custom(isValidObjectId)
        .withMessage("Invalid comment ID"),
];

const validateVideoId = [
    param("videoId")
        .custom(isValidObjectId)
        .withMessage("Invalid video ID"),
];

export {
    addCommentValidator,
    updateCommentValidator,
    validateCommentId,
    validateVideoId,
};
