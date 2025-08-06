import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const channelId = req.user._id; // trusted from JWT

    const totalVideos = await Video.countDocuments({ owner: channelId });

    const viewsAggregation = await Video.aggregate([
        { $match: { owner: channelId } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);
    const totalViews = viewsAggregation[0]?.totalViews || 0;

    const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

    const videoIds = await Video.find({ owner: channelId }).distinct("_id");
    const totalLikes = await Like.countDocuments({ video: { $in: videoIds } });

    return res.status(200).json(
        new apiResponse(
            200,
            {
                totalVideos,
                totalViews,
                totalSubscribers,
                totalLikes,
            },
            "Channel stats fetched successfully"
        )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.user._id; // trusted from JWT
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const videos = await Video.find({ owner: channelId })
        .select("_id title thumbnail views createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const totalVideos = await Video.countDocuments({ owner: channelId });

    return res.status(200).json(
        new apiResponse(
            200,
            {
                videos,
                page,
                limit,
                totalVideos,
            },
            "Channel videos fetched successfully"
        )
    );
});

export { getChannelStats, getChannelVideos };
