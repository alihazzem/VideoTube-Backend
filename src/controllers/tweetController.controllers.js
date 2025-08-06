import { Tweet } from "../models/tweet.models.js";
import { User } from "../models/user.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    const tweet = await Tweet.create({
        content,
        owner: req.user._id,
    });

    return res
        .status(201)
        .json(new apiResponse(201, tweet, "Tweet created successfully."));
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
        throw new apiError(404, "User not found");
    }

    const tweets = await Tweet.find({ owner: user._id }).sort({ createdAt: -1 });

    return res.status(200).json(
        new apiResponse(200, tweets, "User tweets fetched successfully")
    );
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new apiError(404, "Tweet not found.");
    }

    if (!tweet.owner.equals(req.user._id)) {
        throw new apiError(403, "Unauthorized to update this tweet.");
    }

    tweet.content = content;
    await tweet.save();

    return res
        .status(200)
        .json(new apiResponse(200, tweet, "Tweet updated successfully."));
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new apiError(404, "Tweet not found.");
    }

    if (!tweet.owner.equals(req.user._id)) {
        throw new apiError(403, "Unauthorized to delete this tweet.");
    }

    await tweet.deleteOne();

    return res
        .status(200)
        .json(new apiResponse(200, null, "Tweet deleted successfully."));
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
};
