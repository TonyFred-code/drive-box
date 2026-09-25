import { supabase } from "../config/supabase.js";
import { SUPABASE_ERROR_CODES } from "../constants/errorCodes.js";
import { generateUniqueName } from "./fileUtils.js";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET;

const MAX_EXPIRY_SECONDS = 60 * 60; // 1 hour
const DEFAULT_EXPIRY_SECONDS = 15 * 60; // 15 minutes

/**
 * Uploads a file buffer to Supabase Storage (private bucket).
 * Returns only the storagePath — no public URL is generated.
 *
 * @param {Buffer} fileBuffer
 * @param {string} originalName
 * @param {string} mimeType
 * @param {string} userId
 * @returns {{ storagePath: string }}
 */
async function uploadToStorage(fileBuffer, originalName, mimeType, userId) {
  if (!BUCKET) {
    throw new Error("SUPABASE_STORAGE_BUCKET env variable is not set");
  }

  const uniqueName = generateUniqueName(originalName);
  const storagePath = `${userId}/${uniqueName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    const errMsg = `[storage] ${error?.message || "Failed to upload file to storage"} for ${originalName}`;
    const err = new Error(errMsg);
    err.code = SUPABASE_ERROR_CODES.FILE_UPLOAD_FAILED;
    console.error(errMsg);
    throw err;
  }

  return { storagePath };
}

/**
 * Generates a short-lived signed URL for a private storage object.
 *
 * @param {string} storagePath  - Supabase Storage object path
 * @param {number} expiresIn    - Expiry in seconds (default 15min, max 1hr)
 * @param {boolean} download    - true = attachment disposition, false = inline
 * @returns {string} signed URL
 */
async function createSignedUrl(storagePath, expiresIn, download = false) {
  const expiry = Math.min(
    Number.isFinite(expiresIn) && expiresIn > 0
      ? expiresIn
      : DEFAULT_EXPIRY_SECONDS,
    MAX_EXPIRY_SECONDS
  );

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiry, { download });

  if (error) {
    console.error("[storage] signed URL error:", error.message);
    const err = new Error("Failed to generate signed URL");
    err.code = SUPABASE_ERROR_CODES.SIGNED_URL_FAILED;
    throw err;
  }

  return data.signedUrl;
}

/**
 * Permanently deletes a file from Supabase Storage.
 *
 * @param {string} storagePath
 */
async function deleteFromStorage(storagePath) {
  if (!storagePath) return;

  const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);

  if (error) {
    console.error(
      `[storage] Failed to delete "${storagePath}":`,
      error.message
    );
    const err = new Error("Failed to delete file from storage");
    err.code = SUPABASE_ERROR_CODES.FILE_DELETE_FAILED;
    throw err;
  }
}

export { uploadToStorage, createSignedUrl, deleteFromStorage };
