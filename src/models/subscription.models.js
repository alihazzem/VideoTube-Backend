import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId, // one who is SUBCRIBING
            ref: "User",
        },
        channel: {
            type: Schema.Types.ObjectId, // one who is SUBSCRIBED
            ref: "User",
        },
    },
    { timestamps: true, }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);