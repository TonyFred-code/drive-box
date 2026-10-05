import multer from "multer";
import { multerUpload } from "../config/multer.js";
import { MULTER_ERROR_CODES } from "../constants/errorCodes.js";
import {
  MAX_FILES_COUNT_PER_UPLOAD,
  MAX_TOTAL_SIZE,
} from "../constants/fileConstants.js";
import { formatBytes } from "../lib/fileUtils.js";

function getMulterErrorMessage(err) {
  switch (err.code) {
    case "LIMIT_UNEXPECTED_FILE":
      if (err.field === "files") {
        return `Too many files selected. Maximum allowed is ${MAX_FILES_COUNT_PER_UPLOAD} files per upload.`;
      }
      return `Unexpected form field "${err.field}". Files must be uploaded under the "files" field.`;

    case "LIMIT_FILE_COUNT":
      return `Too many files selected. Maximum allowed is ${MAX_FILES_COUNT_PER_UPLOAD} files per upload.`;

    case "LIMIT_FILE_SIZE":
      return `One or more files size exceeds the maximum limit of ${formatBytes(MAX_TOTAL_SIZE)}. Maximum of ${formatBytes(MAX_TOTAL_SIZE)} per upload is allowed.`;

    case "LIMIT_PART_COUNT":
      return "Upload rejected: Too many parts in multipart request.";

    case "LIMIT_FIELD_KEY":
      return "Upload rejected: Form field name is too long.";

    case "LIMIT_FIELD_VALUE":
      return "Upload rejected: Form field value is too long.";

    case "LIMIT_FIELD_COUNT":
      return "Upload rejected: Too many form fields.";

    default:
      return err.message || "File upload failed due to a Multer error.";
  }
}

function multerMultiFileUploadMiddleware(req, res, next) {
  multerUpload.array("files", MAX_FILES_COUNT_PER_UPLOAD)(req, res, (err) => {
    if (!err) {
      return next();
    }

    let status = 400;
    let msg = "File upload error";

    if (err instanceof multer.MulterError) {
      status = 400;
      msg = getMulterErrorMessage(err);
    } else {
      console.error("[multer] Unexpected upload error:", err);
      status = 503;
      msg = "An unexpected error occurred during file upload.";
    }

    return res.status(status).json({
      success: false,
      data: {
        stored: [],
        failed: [],
        msg,
      },
    });
  });
}

export { multerMultiFileUploadMiddleware };
