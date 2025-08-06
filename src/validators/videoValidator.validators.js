import mongoose from "mongoose";
import { body, param } from "express-validator";

const publishVideoValidator = [
    body("title")
        .trim()
        .notEmpty().withMessage("Title is required")
        .isLength({ min: 3 }).withMessage("Title must be at least 3 characters"),
    body("description")
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
];

const updateVideoValidator = [
    body("title")
        .optional()
        .trim()
        .isLength({ min: 3 }).withMessage("Title must be at least 3 characters if provided"),
    body("description")
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
];

const validateVideoId = [
    param("videoId")
        .custom(value => mongoose.Types.ObjectId.isValid(value))
        .withMessage("Invalid video ID"),
];

export {
    publishVideoValidator,
    updateVideoValidator,
    validateVideoId,
};
