import { Playlist } from "../models/playlist.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user._id;

    // Check for duplicate playlist name (business logic)
    const existing = await Playlist.findOne({ name });
    if (existing) {
        throw new apiError(400, "Playlist name already exists");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: userId,
        videos: [],
    });

    return res
        .status(201)
        .json(new apiResponse(201, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const playlists = await Playlist.find({ owner: userId }).populate("videos");

    return res
        .status(200)
        .json(new apiResponse(200, playlists, "User playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    const playlist = await Playlist.findById(playlistId).populate("videos owner", "username email");
    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }

    return res
        .status(200)
        .json(new apiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    const userId = req.user._id;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }

    if (!playlist.owner.equals(userId)) {
        throw new apiError(403, "Not authorized to modify this playlist");
    }

    if (playlist.videos.includes(videoId)) {
        return res
            .status(400)
            .json(new apiResponse(400, null, "Video already in playlist"));
    }

    playlist.videos.push(videoId);
    await playlist.save();

    return res
        .status(200)
        .json(new apiResponse(200, playlist, "Video added to playlist"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    const userId = req.user._id;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }

    if (!playlist.owner.equals(userId)) {
        throw new apiError(403, "Not authorized to modify this playlist");
    }

    if (!playlist.videos.includes(videoId)) {
        return res
            .status(400)
            .json(new apiResponse(400, null, "Video not found in playlist"));
    }

    playlist.videos.pull(videoId);
    await playlist.save();

    return res
        .status(200)
        .json(new apiResponse(200, playlist, "Video removed from playlist"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const userId = req.user._id;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }

    if (!playlist.owner.equals(userId)) {
        throw new apiError(403, "Not authorized to delete this playlist");
    }

    await playlist.deleteOne();

    return res
        .status(200)
        .json(new apiResponse(200, null, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    const userId = req.user._id;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }

    if (!playlist.owner.equals(userId)) {
        throw new apiError(403, "Not authorized to update this playlist");
    }

    if (name) playlist.name = name;
    if (description) playlist.description = description;

    await playlist.save();

    return res
        .status(200)
        .json(new apiResponse(200, playlist, "Playlist updated successfully"));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
};
