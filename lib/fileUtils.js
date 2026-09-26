import path from "path";

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

export {
  extractFileNameWithoutExt,
  extractFileExtension,
  generateUniqueName,
  formatBytes,
};
