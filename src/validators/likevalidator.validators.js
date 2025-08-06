import mongoose from "mongoose";
import { param } from "express-validator";
import { Video } from "../models/video.models.js";
import { Comment } from "../models/comment.models.js";
import { Tweet } from "../models/tweet.models.js";

const validateVideoId = [
    param("videoId")
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage("Invalid video ID")
        .bail()
        .custom(async (value) => {
            const videoExists = await Video.exists({ _id: value });
            if (!videoExists) {
                return Promise.reject("Video not found");
            }
        }),
];

const validateCommentId = [
    param("commentId")
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage("Invalid comment ID")
        .bail()
        .custom(async (value) => {
            const commentExists = await Comment.exists({ _id: value });
            if (!commentExists) {
                return Promise.reject("Comment not found");
            }
        }),
];

const validateTweetId = [
    param("tweetId")
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage("Invalid tweet ID")
        .bail()
        .custom(async (value) => {
            const tweetExists = await Tweet.exists({ _id: value });
            if (!tweetExists) {
                return Promise.reject("Tweet not found");
            }
        }),
];

export { validateVideoId, validateCommentId, validateTweetId };
