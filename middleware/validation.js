const Joi = require("@hapi/joi");

const validationMiddleware = (req, res, next) => {
  // Define the validation schema using Joi
  const schema = Joi.object({
    firstName: Joi.string().min(3).required().pattern(new RegExp(/^[^\s].+[^\s]$/)).messages({
      "any.required": "firstName is required.",
      "string.empty": "firstName cannot be an empty string.",
      "string.min": "first name must be at least 3 characters long.",
      "string.pattern.base": "first name cannot start or end with a whitespace.",
    }),
    lastName: Joi.string().min(3).required().pattern(new RegExp(/^[^\s].+[^\s]$/)).messages({
      "any.required": "lastName is required.",
      "string.empty": "lastName cannot be an empty string.",
      "string.min": "lastName must be at least 3 characters long.",
      "string.pattern.base": "lastName cannot start or end with a whitespace.",
    }),
    email: Joi.string().email().required().messages({
      "any.required": "Email is required.",
      "string.email": "Invalid email format.",
    }),
    password: Joi.string()
      .pattern(new RegExp("^(?=.*[!@#$%^&*])(?=.*[A-Z]).{4,}$"))
      .required()
      .messages({
        "any.required": "Password is required.",
        "string.pattern.base":
          "Password must contain at least 4 characters, one capital letter, and one special character (!@#$%^&*).",
      }),
  });

  // Validate the request body against the schema
  const { error } = schema.validate(req.body, { abortEarly: false });

  // If there's a validation error, return a response with the error details
  if (error) {
    const errorMessage = error.details.map((err) => err.message).join(" ");
    return res.status(400).json({ error: errorMessage });
  }

  // If validation is successful, move to the next middleware
  next();
};


module.exports = validationMiddleware