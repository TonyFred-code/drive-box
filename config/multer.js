import multer from "multer";
import { ALLOWED_MIME_TYPES } from "../constants/allowedFileMimeTypes.js";
import { MULTER_ERROR_CODES } from "../constants/errorCodes.js";
import {
  MAX_FILES_COUNT_PER_UPLOAD,
  MAX_TOTAL_SIZE,
} from "../constants/fileConstants.js";

const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_TOTAL_SIZE, // Prevent malicious DoS attacks
  },
});

export { multerUpload };
