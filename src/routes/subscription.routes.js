import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscriptionController.controllers.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import { subscriberValidator, subscriptionValidator } from '../validators/subscriptionValidator.validators.js';
import { validateRequest } from '../middlewares/validateRequest.middlewares.js';
import rateLimiter from "../middlewares/rateLimit.middlewares.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/c/:channelId")
    .get(subscriptionValidator, validateRequest, getSubscribedChannels)
    .post(rateLimiter, subscriptionValidator, validateRequest, toggleSubscription);

router.route("/u/:subscriberId").get(subscriberValidator, validateRequest, getUserChannelSubscribers);

export default router