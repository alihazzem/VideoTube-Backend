import { query } from "express-validator";

const validateGetChannelVideos = [
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer")
        .toInt(), // converts to int

    query("limit")
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage("Limit must be a positive integer and at most 50")
        .toInt(),
];

export { validateGetChannelVideos };