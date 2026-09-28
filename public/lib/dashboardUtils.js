import { VALID_CHARS_REGEX } from "../constants/dashboardConstants.js";

function extractFileNameWithoutExt(fileName) {
  if (!fileName) return "";
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex <= 0) return fileName;
  return fileName.slice(0, lastDotIndex);
}

function extractFileExtension(fileName) {
  if (!fileName) return "";
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex <= 0) return "";
  return fileName.slice(lastDotIndex);
}

function validateFileName(name) {
  if (typeof name !== "string") {
    return { valid: false, message: "File name must be a string" };
  }

  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, message: "File name cannot be empty" };
  }

  if (trimmed.length > 32) {
    return {
      valid: false,
      message: "File name must be 32 characters or less",
    };
  }

  if (!trimmed.match(VALID_CHARS_REGEX)) {
    return {
      valid: false,
      message:
        "File name can only contain letters, numbers, underscores, hyphens, and spaces",
    };
  }

  return { valid: true, message: "" };
}

function validateFolderName(name) {
  if (typeof name !== "string") {
    return { valid: false, message: "Folder name must be a string" };
  }

  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, message: "Folder name cannot be empty" };
  }

  if (trimmed.length > 32) {
    return {
      valid: false,
      message: "Folder name must be 32 characters or less",
    };
  }

  if (!trimmed.match(VALID_CHARS_REGEX)) {
    return {
      valid: false,
      message:
        "Folder name can only contain letters, numbers, underscores, hyphens, and spaces",
    };
  }

  return { valid: true, message: "" };
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
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

export {
  extractFileNameWithoutExt,
  validateFileName,
  extractFileExtension,
  validateFolderName,
  formatDate,
  formatBytes,
};
