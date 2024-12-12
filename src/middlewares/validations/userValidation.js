import joi from "joi";

// Fungsi validasi request menggunakan schema tertentu
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        details: error.details.map((err) => err.message),
      });
    }
    next();
  };
};

// Schema untuk validasi data registrasi user
const registerSchema = joi.object({
  name: joi.string().min(3).max(100).required().messages({
    "string.empty": "Name is required.",
    "string.min": "Name must be at least 3 characters long.",
    "string.max": "Name must not exceed 100 characters.",
  }),

  email: joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.email": "Email must be a valid email address.",
  }),

  password: joi.string().min(8).max(30).required().messages({
    "string.empty": "Password is required.",
    "string.min": "Password must be at least 8 characters long.",
    "string.max": "Password must not exceed 30 characters.",
  }),

  numberPhone: joi
    .string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required.",
      "string.pattern.base": "Phone number must be between 10-15 digits.",
    }),
});

const loginSchema = joi.object({
  email: joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.email": "Email must be a valid email address.",
  }),
  password: joi.string().min(8).max(30).required().messages({
    "string.empty": "Password is required.",
    "string.min": "Password must be at least 8 characters long.",
    "string.max": "Password must not exceed 30 characters.",
  }),
});

// Schema untuk validasi data update user
const updateUserSchema = joi.object({
  name: joi.string().min(3).max(100).optional().messages({
    "string.min": "Name must be at least 3 characters long.",
    "string.max": "Name must not exceed 100 characters.",
  }),

  email: joi.string().email().optional().messages({
    "string.email": "Email must be a valid email address.",
  }),

  numberPhone: joi
    .string()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .messages({
      "string.pattern.base": "Phone number must be between 10-15 digits.",
    }),
});

const otpSchema = joi.object({
  userId: joi.number().required().messages({
    "any.required": "User ID is required.",
    "number.base": "User ID must be a number.",
  }),
  otp: joi.string().length(6).pattern(/^\d+$/).required().messages({
    "string.empty": "OTP is required.",
    "string.length": "OTP must be exactly 6 digits.",
    "string.pattern.base": "OTP must only contain digits.",
  }),
});

const forgotPasswordSchema = joi.object({
  email: joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.email": "Email must be a valid email address.",
  }),
});

const resetPasswordSchema = joi.object({
  token: joi.string().required().messages({
    "string.empty": "Token is required.",
  }),
  newPassword: joi.string().min(8).max(30).required().messages({
    "string.empty": "New password is required.",
    "string.min": "New password must be at least 8 characters long.",
    "string.max": "New password must not exceed 30 characters.",
  }),
  confirmPassword: joi
    .string()
    .valid(joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Confirm password must match new password.",
      "string.empty": "Confirm password is required.",
    }),
});

export {
  validate,
  registerSchema,
  loginSchema,
  updateUserSchema,
  otpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
