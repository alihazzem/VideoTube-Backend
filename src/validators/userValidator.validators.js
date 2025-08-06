import { body, param, query } from "express-validator";

const registerUserValidator = [
    body("fullname")
        .trim()
        .notEmpty().withMessage("Fullname is required")
        .isLength({ min: 3 }).withMessage("Fullname must be at least 3 characters"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Must be a valid email address")
        .normalizeEmail(),

    body("username")
        .trim()
        .notEmpty().withMessage("Username is required")
        .isLength({ min: 3 }).withMessage("Username must be at least 3 characters")
        .isAlphanumeric().withMessage("Username must contain only letters and numbers")
        .toLowerCase(),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
        .matches(/\d/).withMessage("Password must contain at least one number")
        .matches(/[\W_]/).withMessage("Password must contain at least one special character")
];

const loginUserValidator = [
    body()
        .custom((value, { req }) => {
            if (!req.body.username && !req.body.email) {
                throw new Error("Username or email is required");
            }
            return true;
        }),

    body("username")
        .optional()
        .trim()
        .isLength({ min: 3 }).withMessage("Username must be at least 3 characters")
        .isAlphanumeric().withMessage("Username must contain only letters and numbers")
        .toLowerCase(),

    body("email")
        .optional()
        .trim()
        .isEmail().withMessage("Must be a valid email address")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required")
];

const changePasswordValidator = [
    body("oldPassword")
        .notEmpty()
        .withMessage("Old password is required"),

    body("newPassword")
        .notEmpty()
        .withMessage("New password is required")
        .isLength({ min: 8 })
        .withMessage("New password must be at least 8 characters")
        .matches(/[A-Z]/)
        .withMessage("New password must contain at least one uppercase letter")
        .matches(/[a-z]/)
        .withMessage("New password must contain at least one lowercase letter")
        .matches(/[0-9]/)
        .withMessage("New password must contain at least one number")
        .matches(/[\W_]/)
        .withMessage("New password must contain at least one special character")
        .custom((value, { req }) => {
            if (value === req.body.oldPassword) {
                throw new Error("New password must be different from old password");
            }
            return true;
        }),
];

const updateAccountValidator = [
    body("fullname")
        .optional()
        .isLength({ min: 3 }).withMessage("Full name must be at least 3 characters long")
        .matches(/^[a-zA-Z\s]+$/).withMessage("Full name can only contain letters and spaces"),

    body("email")
        .optional()
        .isEmail().withMessage("Please provide a valid email address"),
];

const usernameParamValidator = [
    param("username")
        .trim()
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters long")
        .isAlphanumeric()
        .withMessage("Username must contain only letters and numbers")
        .toLowerCase(),
];

const watchHistoryValidator = [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1 }).withMessage("Limit must be a positive integer"),
];

export {
    registerUserValidator,
    loginUserValidator,
    changePasswordValidator,
    updateAccountValidator,
    usernameParamValidator,
    watchHistoryValidator,
};
