import { Router } from 'express';
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlistController.controls.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import { validatePlaylistId, validateVideoId, validateUserId, validateCreatePlaylist, validateUpdatePlaylist } from '../validators/playlistValidator.validators.js';
import { validateRequest } from '../middlewares/validateRequest.middlewares.js';
import rateLimiter from "../middlewares/rateLimit.middlewares.js"

const router = Router();

router.use(verifyJWT);

router.post("/", rateLimiter, validateCreatePlaylist, validateRequest, createPlaylist);

router
    .route("/:playlistId")
    .get(validatePlaylistId, validateRequest, getPlaylistById)
    .patch(rateLimiter, validatePlaylistId, validateUpdatePlaylist, validateRequest, updatePlaylist)
    .delete(rateLimiter, validatePlaylistId, validateRequest, deletePlaylist);

router.patch(
    "/:playlistId/add/:videoId",
    rateLimiter,
    validatePlaylistId,
    validateVideoId,
    validateRequest,
    addVideoToPlaylist);

router.patch(
    "/:playlistId/remove/:videoId",
    rateLimiter,
    validatePlaylistId,
    validateVideoId,
    validateRequest,
    removeVideoFromPlaylist);

router.get("/user/:userId", validateUserId, validateRequest, getUserPlaylists);

export default router;
