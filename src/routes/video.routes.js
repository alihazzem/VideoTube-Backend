import { Router } from 'express';
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo, } from "../controllers/videoController.controllers.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import { uploadImage, uploadMixed } from "../middlewares/multer.middlewares.js"
import { publishVideoValidator, updateVideoValidator, validateVideoId } from "../validators/videoValidator.validators.js"
import { validateRequest } from "../middlewares/validateRequest.middlewares.js";
import rateLimiter from "../middlewares/rateLimit.middlewares.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/")
    .get(getAllVideos)
    .post(
        rateLimiter,
        uploadMixed.fields([
            { name: "videoFile", maxCount: 1, },
            { name: "thumbnail", maxCount: 1, },

        ]),
        publishVideoValidator,
        validateRequest,
        publishAVideo
    );

router
    .route("/:videoId")
    .get(
        validateVideoId,
        validateRequest,
        getVideoById)
    .delete(
        validateVideoId,
        validateRequest,
        deleteVideo)
    .patch(uploadImage.single("thumbnail"),
        validateVideoId,
        updateVideoValidator,
        validateRequest,
        updateVideo);

router.route("/toggle/publish/:videoId").patch(
    validateVideoId,
    validateRequest,
    togglePublishStatus);

export default router