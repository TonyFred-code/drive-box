import multer from "multer";
import { ALLOWED_MIME_TYPES } from "../constants/alloedFileMimeTypes.js";
import { MULTER_ERROR_CODES } from "../constants/errorCodes.js";

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
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 10, // 10 files per upload
  },
  fileFilter,
});

export { multerUpload };
