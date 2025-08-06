import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweetController.controllers.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import { createTweetValidator, getUserTweetsValidator, updateTweetValidator, deleteTweetValidator } from "../validators/tweetValidator.validators.js"
import { validateRequest } from "../middlewares/validateRequest.middlewares.js";
import rateLimiter from "../middlewares/rateLimit.middlewares.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(
    rateLimiter,
    createTweetValidator,
    validateRequest,
    createTweet);
router.route("/user/:username").get(
    getUserTweetsValidator,
    validateRequest,
    getUserTweets);
router.route("/:tweetId").patch(
    rateLimiter,
    updateTweetValidator,
    validateRequest,
    updateTweet).delete(
        rateLimiter,
        deleteTweetValidator,
        validateRequest,
        deleteTweet);

export default router