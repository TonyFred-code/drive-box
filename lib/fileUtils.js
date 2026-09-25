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

export { extractFileNameWithoutExt, extractFileExtension, generateUniqueName };
