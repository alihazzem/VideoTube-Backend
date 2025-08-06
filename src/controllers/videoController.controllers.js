import mongoose from "mongoose"
import { Video } from "../models/video.models.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = "desc", userId } = req.query;

    const matchStage = {
        $match: {
            $and: [
                query ? {
                    $or: [
                        { title: { $regex: query, $options: "i" } },
                        { description: { $regex: query, $options: "i" } }
                    ]
                } : {},
                userId ? { owner: new mongoose.Types.ObjectId(userId) } : { isPublished: true }
            ]
        }
    };

    const sortStage = {
        $sort: {
            [sortBy]: sortType === "asc" ? 1 : -1
        }
    };

    const aggregateQuery = Video.aggregate([
        matchStage,
        sortStage
    ]);

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        populate: {
            path: "owner",
            select: "username avatar"
        }
    };

    const videos = await Video.aggregatePaginate(aggregateQuery, options);

    return res.status(200).json(new apiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const ownerId = req.user._id;

    const videoFile = req.files?.videoFile?.[0]?.path;
    const thumbnailFile = req.files?.thumbnail?.[0]?.path;


    if (!videoFile || !thumbnailFile) {
        throw new apiError(400, "Video and thumbnail are required");
    }

    const uploadedVideo = await uploadOnCloudinary(videoFile);
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailFile);

    if (!uploadedVideo?.url || !uploadedThumbnail?.url) {
        throw new apiError(500, "Cloudinary upload failed");
    }

    const newVideo = await Video.create({
        videoFile: uploadedVideo.url,
        thumbnail: uploadedThumbnail.url,
        title,
        description,
        duration: uploadedVideo.duration || 0, // optional
        owner: ownerId,
        isPublished: true
    });

    return res.status(201).json(new apiResponse(201, newVideo, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const requesterId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId).populate("owner", "username avatar");

    if (!video) {
        throw new apiError(404, "Video not found");
    }

    if (!video.isPublished && video.owner._id.toString() !== requesterId.toString()) {
        throw new apiError(403, "This video is not public");
    }

    return res.status(200).json(new apiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const requesterId = req.user._id;
    const { title, description } = req.body;
    const thumbnailFile = req.file?.thumbnail?.[0]?.path;

    const video = await Video.findById(videoId);
    if (!video) {
        throw new apiError(404, "Video not found");
    }

    if (video.owner.toString() !== requesterId.toString()) {
        throw new apiError(403, "Not authorized to update this video");
    }

    if (title) video.title = title;
    if (description) video.description = description;

    if (thumbnailFile) {
        const uploadedThumbnail = await uploadOnCloudinary(thumbnailFile);
        if (uploadedThumbnail?.url) {
            video.thumbnail = uploadedThumbnail.url;
        }
    }

    await video.save();
    return res.status(200).json(new apiResponse(200, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const requesterId = req.user._id;

    const video = await Video.findById(videoId);
    if (!video) {
        throw new apiError(404, "Video not found");
    }

    if (video.owner.toString() !== requesterId.toString()) {
        throw new apiError(403, "Not authorized to delete this video");
    }

    await Video.findByIdAndDelete(videoId);

    // Optional: delete video and thumbnail from Cloudinary if you store public IDs

    return res.status(200).json(new apiResponse(200, null, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const requesterId = req.user._id;

    const video = await Video.findById(videoId);
    if (!video) {
        throw new apiError(404, "Video not found");
    }

    if (video.owner.toString() !== requesterId.toString()) {
        throw new apiError(403, "Not authorized to toggle publish status");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    return res.status(200).json(
        new apiResponse(200, { isPublished: video.isPublished }, `Video ${video.isPublished ? "published" : "unpublished"} successfully`)
    );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};
