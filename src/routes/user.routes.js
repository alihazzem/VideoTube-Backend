import { Router } from "express";
import { registerUser, logoutUser, loginUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, getUserChannelProfile, updateAccountDetails, updateAvatar, updateCoverImage, getWatchHistory } from "../controllers/userController.controllers.js";
import { uploadImage } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { registerUserValidator, loginUserValidator, changePasswordValidator, updateAccountValidator, usernameParamValidator, watchHistoryValidator } from "../validators/userValidator.validators.js";
import { validateRequest } from "../middlewares/validateRequest.middlewares.js";
import rateLimiter from "../middlewares/rateLimit.middlewares.js";

const router = Router();

// Unsecured Routes
router.route("/register").post(
    rateLimiter,
    uploadImage.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUserValidator,
    validateRequest,
    registerUser
);
router.route("/login").post(
    rateLimiter,
    loginUserValidator,
    validateRequest,
    loginUser);
router.route("/refresh-token").post(rateLimiter, refreshAccessToken);

// Secured Routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").patch(verifyJWT,
    changePasswordValidator,
    validateRequest,
    changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/c/:username").get(verifyJWT,
    usernameParamValidator,
    validateRequest,
    getUserChannelProfile);
router.route("/update-account").patch(verifyJWT,
    updateAccountValidator,
    validateRequest,
    updateAccountDetails);
router.route("/update-avatar").patch(verifyJWT, uploadImage.single("avatar"), updateAvatar);
router.route("/update-cover-image").patch(verifyJWT, uploadImage.single("coverImage"), updateCoverImage);
router.route("/watch-history").get(verifyJWT,
    watchHistoryValidator,
    validateRequest,
    getWatchHistory);


export default router;