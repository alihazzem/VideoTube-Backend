import { param } from "express-validator";

const subscriptionValidator = [
    param("channelId")
        .isMongoId().withMessage("Invalid channel ID"),
];

const subscriberValidator = [
    param("subscriberId")
        .isMongoId().withMessage("Invalid subscriber ID"),
];

export { subscriptionValidator, subscriberValidator };
