import path from "path";
import {
  MAX_FILENAME_LENGTH,
  VALID_FILENAME_REGEX,
} from "../constants/fileConstants.js";

function extractFileNameWithoutExt(fileName) {
  const ext = path.extname(fileName);
  return path.basename(fileName, ext);
}

function extractFileExtension(fileName) {
  return path.extname(fileName);
}

function generateUniqueName(originalName) {
  const ext = extractFileExtension(originalName);
  const baseName = extractFileNameWithoutExt(originalName);
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  return `${baseName}-${uniqueSuffix}${ext}`;
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = 2;
  const sizes = ["Bytes", "KB", "MB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  );
}

/**
 * Validates a file name before upload.
 *
 * The character-set check runs on the stem only (extension contains a dot
 * which would incorrectly fail the regex). The length check runs on the
 * full original name (stem + extension) because that is the value stored
 * in File.name VARCHAR(32).
 *
 * @param {string} stem     - File name without extension
 * @param {string} fullName - Complete original file name (stem + extension)
 * @returns {{ valid: boolean, reason: string }}
 */
function validateFileDisplayName(stem, fullName) {
  const trimmedStem = stem.trim();
  const trimmedFull = fullName.trim();

  if (!trimmedStem)
    return {
      valid: false,
      reason: "File name is missing.",
    };

  if (trimmedFull.length > MAX_FILENAME_LENGTH) {
    return {
      valid: false,
      reason: `File name exceeds the ${MAX_FILENAME_LENGTH}-character limit (${trimmedFull.length} characters).`,
    };
  }

  if (!trimmedStem.match(VALID_FILENAME_REGEX)) {
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

export {
  extractFileNameWithoutExt,
  extractFileExtension,
  generateUniqueName,
  formatBytes,
  validateFileDisplayName,
};
