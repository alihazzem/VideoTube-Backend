import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
} from "../controllers/likeController.controllers.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import { validateCommentId, validateTweetId, validateVideoId } from '../validators/likevalidator.validators.js';
import { validateRequest } from '../middlewares/validateRequest.middlewares.js';
import rateLimiter from "../middlewares/rateLimit.middlewares.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/v/:videoId").post(rateLimiter, validateVideoId, validateRequest, toggleVideoLike);
router.route("/toggle/c/:commentId").post(rateLimiter, validateCommentId, validateRequest, toggleCommentLike);
router.route("/toggle/t/:tweetId").post(rateLimiter, validateTweetId, validateRequest, toggleTweetLike);
router.route("/videos").get(getLikedVideos);

export default router