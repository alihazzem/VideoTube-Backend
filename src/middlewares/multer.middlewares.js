// multerConfig.js
import multer from "multer";
import path from "path";

// Use env var or default folder for uploads
const UPLOAD_PATH = process.env.UPLOAD_PATH || './public/temp';

// Sanitize filenames: replace spaces with underscores and remove unsafe chars
const sanitizeFilename = (name) => {
    return name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9-_]/g, '');
};

// Multer storage config (disk storage)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_PATH);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        const cleanName = sanitizeFilename(baseName);
        cb(null, `${cleanName}-${Date.now()}${ext}`);
    }
});

// MIME type whitelists
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const allowedVideoTypes = ['video/mp4', 'video/quicktime']; // mp4, mov
const allowedMixedTypes = [...allowedImageTypes, ...allowedVideoTypes];

// File filters
const imageFileFilter = (req, file, cb) => {
    if (allowedImageTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, or WebP image files are allowed!'), false);
    }
};

const videoFileFilter = (req, file, cb) => {
    if (allowedVideoTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only MP4 or MOV video files are allowed!'), false);
    }
};

const mixedFileFilter = (req, file, cb) => {
    if (allowedMixedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image and video files are allowed!'), false);
    }
};

// File size limits (adjust as needed)
const imageLimits = {
    fileSize: 5 * 1024 * 1024, // 5 MB max for images
};
const videoLimits = {
    fileSize: 100 * 1024 * 1024, // 50 MB max for videos
};
const mixedLimits = {
    fileSize: 50 * 1024 * 1024, // 50 MB max for mixed
};

// Multer uploaders exported for use in routes
export const uploadImage = multer({
    storage,
    fileFilter: imageFileFilter,
    limits: imageLimits,
});

export const uploadVideo = multer({
    storage,
    fileFilter: videoFileFilter,
    limits: videoLimits,
});

export const uploadMixed = multer({
    storage,
    fileFilter: mixedFileFilter,
    limits: mixedLimits,
});
