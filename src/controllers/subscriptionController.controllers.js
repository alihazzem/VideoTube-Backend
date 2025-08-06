import { Subscription } from "../models/subscription.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// 1. Toggle subscription between current user and a channel
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user._id;

    if (channelId === subscriberId.toString()) {
        throw new apiError(400, "You cannot subscribe to yourself");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId,
    });

    if (existingSubscription) {
        await Subscription.deleteOne({ _id: existingSubscription._id });
        return res.status(200).json(
            new apiResponse(200, { subscribed: false }, "Unsubscribed successfully")
        );
    } else {
        await Subscription.create({
            subscriber: subscriberId,
            channel: channelId,
        });
        return res.status(201).json(
            new apiResponse(201, { subscribed: true }, "Subscribed successfully")
        );
    }
});

// 2. Get all channels a user is subscribed to
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    const subscriptions = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "username avatar name");

    return res.status(200).json(
        new apiResponse(200, subscriptions, "Subscribed channels fetched successfully")
    );
});

// 3. Get all subscribers of a given channel
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    const subscribers = await Subscription.find({ channel: channelId })
        .populate("subscriber", "username avatar name");

    return res.status(200).json(
        new apiResponse(200, subscribers, "Channel subscribers fetched successfully")
    );
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};
