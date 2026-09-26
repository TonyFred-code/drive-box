import multer from "multer";
import { ALLOWED_MIME_TYPES } from "../constants/allowedFileMimeTypes.js";
import { MULTER_ERROR_CODES } from "../constants/errorCodes.js";
import {
  MAX_FILES_COUNT_PER_UPLOAD,
  MAX_TOTAL_SIZE,
} from "../constants/fileConstants.js";

function fileFilter(req, file, cb) {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error(
      `"${file.originalname}" is not an allowed file type. ` +
        `Accepted: images, text files, PDF, and Office documents.`
    );
    err.code = MULTER_ERROR_CODES.INVALID_FILE_TYPE;
    cb(err, false);
  }
}

const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_TOTAL_SIZE,
    files: MAX_FILES_COUNT_PER_UPLOAD,
  },
  fileFilter,
});

export { multerUpload };
