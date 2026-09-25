import {
  DIRECTORY_ERROR_CODES,
  FILE_ERROR_CODES,
  PRISMA_ERROR_CODES,
  SUPABASE_ERROR_CODES,
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
import { extractFileNameWithoutExt } from "../lib/fileUtils.js";

const VALID_BASENAME_REGEX = /^[a-zA-Z0-9_\- ]+$/;
const MAX_FILE_NAME_LENGTH = 32;

/**
 * Validates a file name
 *
 * @param {string} fileName - Name of the file to be validated
 * @returns {{ valid: boolean, reason: string}}
 */
function validateFileDisplayName(fileName) {
  const trimmed = fileName.trim();

  if (!trimmed)
    return {
      valid: false,
      reason: "File name is missing.",
    };

  if (trimmed.length > 32) {
    return {
      valid: false,
      reason: "File name is too long.",
    };
  }

  if (!trimmed.match(VALID_BASENAME_REGEX)) {
    return {
      valid: false,
      reason:
        "File name can only contain letters, numbers, underscores, hyphens, and spaces",
    };
  }

  return {
    valid: true,
    reason: "",
  };
}

async function uploadMultipleFiles(req, res) {
  const files = req.files;
  const { directoryId } = req.body;
  const userId = req.user.id;

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

    return res.status(status).json({ success: false, error: [{ msg }] });
  }

  const placeholders = [];
  const preflightFailed = [];

  for (const file of files) {
    const fileNameWithoutExt = extractFileNameWithoutExt(file.originalname);
    const fileNameValid = validateFileDisplayName(fileNameWithoutExt);

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
      error: [{ msg: "All files were rejected before upload" }],
      data: { stored: [], failed: preflightFailed },
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
      await updateFileStorageDetails(dbId, storagePath);
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
      error: [{ msg: "All files failed to upload" }],
      data: { stored: [], failed },
    });
  }

  return res.status(200).json({
    success: true,
    msg: `${stored.length} file(s) uploaded successfully`,
    data: { stored, failed },
  });
}

function parseExpiresIn(raw) {
  const MAX = 60 * 60;
  const DEFAULT = 15 * 60;
  if (!raw) return DEFAULT;
  const parsed = parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT;
  return Math.min(parsed, MAX);
}

async function downloadFile(req, res) {
  const { fileId } = req.params;
  const userId = req.user.id;
  const expiresIn = parseExpiresIn(req.query.expiresIn);

  try {
    const file = await getFileForUser(fileId, userId);
    const signedUrl = await createSignedUrl(
      file.storagePath,
      expiresIn,
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
  const expiresIn = parseExpiresIn(req.query.expiresIn);

  try {
    const file = await getFileForUser(fileId, userId);
    const signedUrl = await createSignedUrl(
      file.storagePath,
      expiresIn,
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
    if (error.code === FILE_ERROR_CODES.FILE_NOT_FOUND) {
      msg = "File not found";
      status = 404;
    } else if (error.code === FILE_ERROR_CODES.UNAUTHORIZED) {
      msg = "Unauthorized to delete file";
      status = 403;
    }
    return res.status(status).json({ success: false, error: [{ msg }] });
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
