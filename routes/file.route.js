import { Router } from "express";
import {
  uploadMultipleFiles,
  downloadFile,
  viewFile,
  deleteFile,
  updateFileName,
} from "../controller/file.controller.js";
import { requireAuth } from "../middleware/authGuards.js";
import { multerMultiFileUploadMiddleware } from "../middleware/multerUpload.service.js";
import {
  fileUploadRules,
  fileDeleteRules,
  fileAccessRules,
  fileUpdateRules,
} from "../validator/file.validator.js";
import { handleValidationError } from "../validator/validationHandler.js";

const fileRouter = Router();

fileRouter.use(requireAuth);

// Upload
fileRouter.post(
  "/upload",
  multerMultiFileUploadMiddleware,
  fileUploadRules,
  handleValidationError,
  uploadMultipleFiles
);

// Download — browser gets attachment disposition, saves the file
fileRouter.get(
  "/:fileId/download",
  fileAccessRules,
  handleValidationError,
  downloadFile
);

// View inline — browser renders the file
fileRouter.get(
  "/:fileId/view",
  fileAccessRules,
  handleValidationError,
  viewFile
);

// Soft delete
fileRouter.delete(
  "/:fileId",
  fileDeleteRules,
  handleValidationError,
  deleteFile
);

// Update file name
fileRouter.put(
  "/:fileId",
  fileUpdateRules,
  handleValidationError,
  updateFileName
);

export { fileRouter };
