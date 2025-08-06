import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/commentControllers.controllers.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import { addCommentValidator, updateCommentValidator, validateCommentId, validateVideoId } from '../validators/commentValidator.validators.js';
import { validateRequest } from "../middlewares/validateRequest.middlewares.js";
import rateLimiter from "../middlewares/rateLimit.middlewares.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/:videoId").get(
    validateVideoId,
    validateRequest,
    getVideoComments)
    .post(
        rateLimiter,
        validateVideoId,
        addCommentValidator,
        validateRequest,
        addComment);
router.route("/c/:commentId").delete(
    rateLimiter,
    validateCommentId,
    validateRequest,
    deleteComment)
    .patch(
        rateLimiter,
        validateCommentId,
        updateCommentValidator,
        validateRequest,
        updateComment);

export default router