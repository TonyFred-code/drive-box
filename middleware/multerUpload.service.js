import multer from "multer";
import { multerUpload } from "../config/multer.js";
import { MULTER_ERROR_CODES } from "../constants/errorCodes.js";

function multerMultiFileUploadMiddleware(req, res, next) {
  multerUpload.array("files", 10)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        error: [{ msg: err.message }],
      });
    }

    if (err?.code === MULTER_ERROR_CODES.INVALID_FILE_TYPE) {
      return res.status(415).json({
        success: false,
        error: [{ msg: err.message }],
      });
    }

    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        error: [{ msg: "File upload error" }],
      });
    }

    next();
  });
}

export { multerMultiFileUploadMiddleware };
