import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 30, // Limit each IP to 30 requests per windowMs
    message: {
        success: false,
        status: 429,
        message: "Too many requests, please try again after 10 minutes.",
        errors: [],
        data: null
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export default rateLimiter;
