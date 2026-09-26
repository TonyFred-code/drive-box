import {
  MAX_FILENAME_LENGTH,
  MAX_FILES_COUNT_PER_UPLOAD,
  MAX_TOTAL_SIZE,
  VALID_FILENAME_REGEX,
} from "../constants/fileConstants.js";
import { formatBytes } from "../lib/fileUtils.js";
import { body, param, query } from "./validator.js";

const fileUploadRules = [
  body("directoryId")
    .notEmpty()
    .withMessage("Directory ID is required")
    .isUUID()
    .withMessage("Directory ID must be a UUID"),
  body("files").custom((value, { req }) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new Error("No files uploaded");
    }

    if (req.files.length > MAX_FILES_COUNT_PER_UPLOAD) {
      throw new Error(
        `Maximum of ${MAX_FILES_COUNT_PER_UPLOAD} files can be uploaded at once`
      );
    }

    for (const file of req.files) {
      if (file.size > MAX_TOTAL_SIZE) {
        throw new Error(
          `Maximum individual file size is ${formatBytes(MAX_TOTAL_SIZE)}`
        );
      }
    }

    const totalBytes = req.files.reduce((sum, file) => sum + file.size, 0);

    if (totalBytes > MAX_TOTAL_SIZE) {
      throw new Error(
        `Total upload size exceeds ${formatBytes(MAX_TOTAL_SIZE)} limit. Received: ${formatBytes(totalBytes)}`
      );
    }

    return true;
  }),
];

const fileDeleteRules = [
  param("fileId")
    .notEmpty()
    .withMessage("File ID is required")
    .isUUID()
    .withMessage("File ID must be a UUID"),
];

const fileUpdateRules = [
  param("fileId")
    .notEmpty()
    .withMessage("File ID is required")
    .isUUID()
    .withMessage("File ID must be a UUID"),
  body("name")
    .notEmpty()
    .withMessage("New file name is required")
    .custom((value) => {
      if (!VALID_FILENAME_REGEX.test(value)) {
        throw new Error("File name contains invalid characters");
      }
      return true;
    })
    .isLength({ min: 1, max: MAX_FILENAME_LENGTH })
    .withMessage(
      `File name must be between 1 and ${MAX_FILENAME_LENGTH} characters long`
    ),
];

const fileAccessRules = [
  param("fileId")
    .notEmpty()
    .withMessage("File ID is required")
    .isUUID()
    .withMessage("File ID must be a UUID"),
  query("expiresIn")
    .optional()
    .isInt({ min: 1, max: 3600 })
    .withMessage("expiresIn must be an integer between 1 and 3600 seconds"),
];

export { fileUploadRules, fileDeleteRules, fileAccessRules, fileUpdateRules };
