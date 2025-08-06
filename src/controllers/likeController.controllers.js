import { Like } from "../models/like.models.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    const existingLike = await Like.findOne({ likedBy: userId, video: videoId });

    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(new apiResponse(200, null, "Video like removed"));
    } else {
        await Like.create({ likedBy: userId, video: videoId });
        return res.status(200).json(new apiResponse(200, null, "Video liked successfully"));
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    const existingLike = await Like.findOne({ likedBy: userId, comment: commentId });

    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(new apiResponse(200, null, "Comment like removed"));
    } else {
        await Like.create({ likedBy: userId, comment: commentId });
        return res.status(200).json(new apiResponse(200, null, "Comment liked successfully"));
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;

    const existingLike = await Like.findOne({ likedBy: userId, tweet: tweetId });

    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(new apiResponse(200, null, "Tweet like removed"));
    } else {
        await Like.create({ likedBy: userId, tweet: tweetId });
        return res.status(200).json(new apiResponse(200, null, "Tweet liked successfully"));
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const likedVideos = await Like.find({ likedBy: userId, video: { $exists: true } })
        .select("video -_id");

    const videoIds = likedVideos.map(like => like.video);

    return res.status(200).json(
        new apiResponse(
            200,
            { videoIds, total: videoIds.length },
            "Liked videos fetched successfully"
        )
    );
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};
