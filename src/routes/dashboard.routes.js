import { Router } from 'express';
import {
    getChannelStats,
    getChannelVideos,
} from "../controllers/dashboardController.controllers.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import { validateGetChannelVideos } from '../validators/dashboardValidator.validators.js'
import { validateRequest } from '../middlewares/validateRequest.middlewares.js';
import rateLimiter from "../middlewares/rateLimit.middlewares.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/stats").get(rateLimiter, getChannelStats);
router.route("/videos").get(rateLimiter, validateGetChannelVideos, validateRequest, getChannelVideos);

export default router