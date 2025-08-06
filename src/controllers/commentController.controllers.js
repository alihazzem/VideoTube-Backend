import mongoose from "mongoose";
import { Comment } from "../models/comment.models.js";
import { Video } from "../models/video.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const aggregateQuery = Comment.aggregate([
        { $match: { video: new mongoose.Types.ObjectId(videoId) } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
            },
        },
        { $unwind: "$ownerDetails" },
        {
            $project: {
                content: 1,
                createdAt: 1,
                owner: {
                    _id: "$ownerDetails._id",
                    username: "$ownerDetails.username",
                    avatar: "$ownerDetails.avatar",
                },
            },
        },
        { $sort: { createdAt: -1 } },
    ]);

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
    };

    const comments = await Comment.aggregatePaginate(aggregateQuery, options);

    return res
        .status(200)
        .json(new apiResponse(200, comments, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const videoExists = await Video.findById(videoId);
    if (!videoExists) {
        throw new apiError(404, "Video not found");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: userId,
    });

    return res
        .status(201)
        .json(new apiResponse(201, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new apiError(404, "Comment not found");
    }

    if (comment.owner.toString() !== userId.toString()) {
        throw new apiError(403, "Not authorized to update this comment");
    }

    comment.content = content;
    await comment.save();

    return res
        .status(200)
        .json(new apiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new apiError(404, "Comment not found");
    }

    if (comment.owner.toString() !== userId.toString()) {
        throw new apiError(403, "Not authorized to delete this comment");
    }

    await Comment.findByIdAndDelete(commentId);

    return res
        .status(200)
        .json(new apiResponse(200, null, "Comment deleted successfully"));
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment,
};
