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

export { validate, registerSchema };
