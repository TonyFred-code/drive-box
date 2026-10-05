import {
  DIRECTORY_ERROR_CODES,
  FILE_ERROR_CODES,
  PRISMA_ERROR_CODES,
  SUPABASE_ERROR_CODES,
  USER_ERROR_CODES,
} from "../constants/errorCodes.js";
import {
  createFilePlaceholder,
  updateFileStorageDetails,
  softDeleteFile,
  deleteFile as deleteFileFromDB,
  getFileForUser,
  updateFileName as updateFileNameDB,
} from "../db/file.js";
import { canAllowFileUpload } from "../db/directory.js";
import {
  uploadToStorage,
  createSignedUrl,
  deleteFromStorage,
} from "../lib/storage.js";
import path from "path";
import {
  extractFileNameWithoutExt,
  formatBytes,
  validateFileDisplayName,
} from "../lib/fileUtils.js";
import {
  decrementUserStorageUsed,
  incrementUserStorageUsed,
} from "../db/user.js";
import { MAX_TOTAL_SIZE } from "../constants/fileConstants.js";
import { ALLOWED_MIME_TYPES } from "../constants/allowedFileMimeTypes.js";

async function uploadMultipleFiles(req, res) {
  const files = req.files;
  const { directoryId } = req.body;
  const user = req.user;
  const userId = user.id;

  try {
    await canAllowFileUpload(userId, directoryId);
  } catch (error) {
    let msg = "An unknown error occurred";
    let status = 500;

    if (error.code === DIRECTORY_ERROR_CODES.DIRECTORY_NOT_FOUND) {
      msg = "Directory not found";
      status = 404;
    } else if (error.code === DIRECTORY_ERROR_CODES.DIRECTORY_ACCESS_DENIED) {
      msg = "You do not have permission to upload to this directory";
      status = 403;
    }

    return res.status(status).json({
      success: false,
      data: {
        stored: [],
        failed:
          files?.map((file) => ({
            originalName: file.originalname,
            reason: "Upload rejected. Check error details for more information",
          })) || [],
        msg,
      },
    });
  }

  const uploadFileSize = files.reduce((acc, file) => acc + file.size, 0);

  if (uploadFileSize > MAX_TOTAL_SIZE) {
    const msg = `Upload size exceeds maximum allowed size of ${formatBytes(MAX_TOTAL_SIZE)}. Maximum of ${formatBytes(MAX_TOTAL_SIZE)} per upload is allowed.`;
    return res.status(400).json({
      success: false,
      data: {
        stored: [],
        failed: files.map((file) => ({
          originalName: file.originalname,
          reason: "Upload rejected. Exceeds maximum allowed size",
        })),
        msg,
      },
    });
  }

  if (uploadFileSize > user.storageQuota) {
    const msg = `Upload size exceeds total storage limit. ${formatBytes(user.storageQuota)} total`;
    return res.status(400).json({
      success: false,
      data: {
        stored: [],
        failed: files.map((file) => ({
          originalName: file.originalname,
          reason: "Upload rejected. Exceeds total storage",
        })),
        msg,
      },
    });
  }

  const userFreeStorage = user.storageQuota - user.storageUsed;

  if (uploadFileSize > userFreeStorage) {
    const msg = `Upload size exceeds available storage. ${formatBytes(userFreeStorage)} available`;
    return res.status(400).json({
      success: false,
      data: {
        stored: [],
        failed: files.map((file) => ({
          originalName: file.originalname,
          reason: "Upload rejected. Exceeds available storage",
        })),
        msg,
      },
    });
  }

  const placeholders = [];
  const preflightFailed = [];

  for (const file of files) {
    if (file.size > MAX_TOTAL_SIZE) {
      preflightFailed.push({
        originalName: file.originalname,
        reason: `File size exceeds maximum allowed size of ${formatBytes(MAX_TOTAL_SIZE)}`,
      });
      continue;
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      preflightFailed.push({
        originalName: file.originalname,
        reason: `"${file.originalname}" is not an allowed file type.`,
      });
      continue;
    }

    const fileNameWithoutExt = extractFileNameWithoutExt(file.originalname);
    const fileNameValid = validateFileDisplayName(
      fileNameWithoutExt,
      file.originalname
    );

    if (fileNameValid.valid) {
      try {
        const record = await createFilePlaceholder(file, userId, directoryId);
        placeholders.push({ file, dbId: record.id });
      } catch (error) {
        let reason = "Unknown error";

        if (
          error.code === FILE_ERROR_CODES.FILE_ALREADY_EXISTS ||
          error.code === PRISMA_ERROR_CODES.UNIQUE_CONSTRAIN_VIOLATION
        ) {
          reason = `"${file.originalname}" already exists in this directory`;
        }
        preflightFailed.push({ originalName: file.originalname, reason });
      }
    } else {
      preflightFailed.push({
        originalName: file.originalname,
        reason: fileNameValid.reason,
      });
    }
  }

  if (placeholders.length === 0) {
    return res.status(400).json({
      success: false,
      data: {
        stored: [],
        failed: preflightFailed,
        msg: "All files failed to upload",
      },
    });
  }

  const uploadResults = await Promise.allSettled(
    placeholders.map(async ({ file, dbId }) => {
      const { storagePath } = await uploadToStorage(
        file.buffer,
        file.originalname,
        file.mimetype,
        userId
      );

      try {
        await updateFileStorageDetails(dbId, storagePath);
        await incrementUserStorageUsed(userId, file.size);
      } catch (error) {
        if (
          error.code === USER_ERROR_CODES.STORAGE_INCREMENT_FAILED ||
          error.code === USER_ERROR_CODES.STORAGE_QUOTA_EXCEEDED
        ) {
          console.error(
            `[upload] Failed to update user storage quota for "${file.originalname}" (id: ${dbId}):`,
            error
          );
        } else {
          console.error(
            `[upload] Failed to update file storage details for "${file.originalname}" (id: ${dbId}):`,
            error
          );
        }

        await deleteFromStorage(storagePath).catch((cleanupError) => {
          console.error(
            `[storage] Failed to prune storage object for "${file.originalname}" (id: ${dbId}):`,
            cleanupError
          );
        });

        throw error;
      }
      return { originalName: file.originalname, dbId };
    })
  );

  const stored = [];
  const failed = [...preflightFailed];

  for (let i = 0; i < uploadResults.length; i++) {
    const outcome = uploadResults[i];
    const { file, dbId } = placeholders[i];

    if (outcome.status === "fulfilled") {
      stored.push({ originalName: file.originalname });
    } else {
      const error = outcome.reason;
      let reason = "Upload failed";

      if (error?.code === SUPABASE_ERROR_CODES.FILE_UPLOAD_FAILED) {
        reason = "Failed to upload to storage";
      } else if (error?.code === SUPABASE_ERROR_CODES.SIGNED_URL_FAILED) {
        reason = "Storage error";
      }

      try {
        await deleteFileFromDB(dbId, userId);
      } catch (pruneError) {
        console.error(
          `[upload] Failed to prune placeholder for "${file.originalname}" (id: ${dbId}):`,
          pruneError
        );
      }

      failed.push({ originalName: file.originalname, reason });
    }
  }

  if (stored.length === 0) {
    return res.status(500).json({
      success: false,
      data: { stored: [], failed, msg: "All files failed to upload" },
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      stored,
      failed,
      msg: `${stored.length} file(s) uploaded successfully`,
    },
  });
}

async function downloadFile(req, res) {
  const { fileId } = req.params;
  const userId = req.user.id;

  try {
    const file = await getFileForUser(fileId, userId);
    const signedUrl = await createSignedUrl(
      file.storagePath,
      true // download = true (Content-Disposition: attachment)
    );
    return res.redirect(302, signedUrl);
  } catch (error) {
    let msg = "Failed to download file";
    let status = 500;

    if (error.code === FILE_ERROR_CODES.FILE_NOT_FOUND) {
      msg = "File not found";
      status = 404;
    } else if (error.code === SUPABASE_ERROR_CODES.SIGNED_URL_FAILED) {
      msg = "Could not generate a download link";
    }

    return res.status(status).json({ success: false, error: [{ msg }] });
  }
}

async function viewFile(req, res) {
  const { fileId } = req.params;
  const userId = req.user.id;

  try {
    const file = await getFileForUser(fileId, userId);
    const signedUrl = await createSignedUrl(
      file.storagePath,
      false // download = false (Content-Disposition: inline)
    );
    return res.redirect(302, signedUrl);
  } catch (error) {
    let msg = "Failed to open file";
    let status = 500;
    if (error.code === FILE_ERROR_CODES.FILE_NOT_FOUND) {
      msg = "File not found";
      status = 404;
    } else if (error.code === SUPABASE_ERROR_CODES.SIGNED_URL_FAILED) {
      msg = "Could not generate a view link";
    }
    return res.status(status).json({ success: false, error: [{ msg }] });
  }
}

async function deleteFile(req, res) {
  const { fileId } = req.params;
  const userId = req.user.id;

  try {
    const deletedFile = await softDeleteFile(fileId, userId);
    await decrementUserStorageUsed(userId, deletedFile.size);
    // log but don't fail the request if it errors
    await deleteFromStorage(deletedFile.storagePath).catch((err) =>
      console.error(
        `[delete] Storage removal failed for file ${fileId}:`,
        err.message
      )
    );
    return res.json({ success: true, msg: "File deleted" });
  } catch (error) {
    let msg = "Failed to delete file";
    let status = 500;
    let success = false;
    if (error.code === FILE_ERROR_CODES.FILE_NOT_FOUND) {
      msg = "File not found";
      status = 404;
    } else if (error.code === FILE_ERROR_CODES.UNAUTHORIZED) {
      msg = "Unauthorized to delete file";
      status = 403;
    } else if (error.code === USER_ERROR_CODES.STORAGE_DECREMENT_FAILED) {
      msg = "Failed to update storage used";
      status = 500;
    } else if (error.code === FILE_ERROR_CODES.FILE_ALREADY_DELETED) {
      success = true;
    }

    if (success) {
      // to ensure idempotency
      return res.json({ success, msg: "File already deleted" });
    }

    return res.status(status).json({ success, error: [{ msg }] });
  }
}

async function updateFileName(req, res) {
  const { fileId } = req.params;
  const { name } = req.body;
  const userId = req.user.id;

  try {
    const updatedFile = await updateFileNameDB(fileId, name, userId);
    return res.json({ success: true, msg: "File updated", data: updatedFile });
  } catch (error) {
    let msg = "Failed to update file";
    let status = 500;
    if (error.code === FILE_ERROR_CODES.FILE_NOT_FOUND) {
      msg = "File not found";
      status = 404;
    } else if (error.code === FILE_ERROR_CODES.UNAUTHORIZED) {
      msg = "Unauthorized to update file";
      status = 403;
    } else if (error.code === PRISMA_ERROR_CODES.UNIQUE_CONSTRAIN_VIOLATION) {
      msg = "A file with this name already exists in the current directory";
      status = 409;
    }

    return res.status(status).json({ success: false, error: [{ msg }] });
  }
}

export {
  uploadMultipleFiles,
  downloadFile,
  viewFile,
  deleteFile,
  updateFileName,
};
