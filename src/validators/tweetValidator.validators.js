import { body, param } from "express-validator";
import mongoose from "mongoose";

// Helper to check if ObjectId is valid
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const createTweetValidator = [
    body("content")
        .trim()
        .notEmpty().withMessage("Tweet content is required")
        .isLength({ max: 280 }).withMessage("Tweet content cannot exceed 280 characters"),
];

const getUserTweetsValidator = [
    param("username")
        .trim()
        .notEmpty().withMessage("Username is required")
        .matches(/^[a-zA-Z0-9_]+$/).withMessage("Invalid username format"),
];

const updateTweetValidator = [
    param("tweetId")
        .custom(isValidObjectId).withMessage("Invalid tweet ID"),

    body("content")
        .optional()
        .trim()
        .isLength({ max: 280 }).withMessage("Tweet content cannot exceed 280 characters"),
];

const deleteTweetValidator = [
    param("tweetId")
        .custom(isValidObjectId).withMessage("Invalid tweet ID"),
];

export {
    createTweetValidator,
    getUserTweetsValidator,
    updateTweetValidator,
    deleteTweetValidator,
};
