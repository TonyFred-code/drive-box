import validationResult from "./validator.js";

function handleValidationError(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array(),
    });
  }
  next();
}

export { handleValidationError };
