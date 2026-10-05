import {
  MAX_FILE_SIZE,
  MAX_FILES_COUNT_PER_UPLOAD,
  MAX_TOTAL_UPLOAD_SIZE,
} from "../constants/dashboardConstants.js";
import {
  extractFileNameWithoutExt,
  formatBytes,
  validateFileName,
} from "./dashboardUtils.js";

class SelectedFilesManager {
  constructor() {
    /** @type {Array<{ id: string, file: File, isValid: boolean, error: string | null }>} */
    this.items = [];
    /**
     * @type {string | null}
     */
    this.batchError = null;
  }

  /**
   * Adds new files and runs validation on the entire collection.
   * @param {FileList | File[]} files
   */
  addFiles(files) {
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      this.items.push({
        id: crypto.randomUUID(),
        file,
        isValid: true,
        error: null,
      });
    }

    this.revalidate();
  }

  /**
   * Removes a single file entry by its unique ID.
   * @param {string} id
   */
  removeById(id) {
    this.items = this.items.filter((item) => item.id !== id);
    this.revalidate();
  }

  /**
   * Removes all invalid files in one click.
   */
  removeInvalid() {
    this.revalidate();
    this.items = this.items.filter((item) => item.isValid);
  }

  /**
   * Removes all files from the manager.
   */
  clear() {
    this.items = [];
    this.batchError = null;
  }

  /**
   * Runs per-file and batch-level validation.
   */
  revalidate() {
    this.batchError = null;

    const nameGroups = new Map();
    for (const item of this.items) {
      const name = item.file.name;
      if (!nameGroups.has(name)) {
        nameGroups.set(name, []);
      }
      nameGroups.get(name).push(item);
    }

    for (const item of this.items) {
      const { file } = item;
      const stem = extractFileNameWithoutExt(file.name);
      const nameValidation = validateFileName(stem);
      const duplicates = nameGroups.get(file.name) || [];

      if (file.size > MAX_FILE_SIZE) {
        item.isValid = false;
        item.error = `File size (${formatBytes(file.size)}) exceeds the maximum allowed limit of ${formatBytes(MAX_FILE_SIZE)}.`;
      } else if (!nameValidation.valid) {
        item.isValid = false;
        item.error = nameValidation.message;
      } else if (duplicates.length > 1) {
        item.isValid = false;
        item.error = `Duplicate file: "${file.name}" is selected ${duplicates.length} times in this upload.`;
      } else {
        item.isValid = true;
        item.error = null;
      }
    }

    if (this.items.length > MAX_FILES_COUNT_PER_UPLOAD) {
      this.batchError = `Too many files selected (${this.items.length} files). Maximum allowed is ${MAX_FILES_COUNT_PER_UPLOAD} files per upload.`;
    } else if (this.totalSize > MAX_TOTAL_UPLOAD_SIZE) {
      this.batchError = `Total upload size (${formatBytes(this.totalSize)}) exceeds the maximum limit of ${formatBytes(MAX_TOTAL_UPLOAD_SIZE)}.`;
    }
  }

  get count() {
    return this.items.length;
  }

  get totalSize() {
    return this.items.reduce((sum, item) => sum + item.file.size, 0);
  }

  get invalidCount() {
    return this.items.filter((item) => !item.isValid).length;
  }

  get hasErrors() {
    return this.invalidCount > 0 || this.batchError !== null;
  }

  get allFiles() {
    return this.items.map((item) => item.file);
  }

  isEmpty() {
    return this.items.length === 0;
  }

  /**
   * Creates a FormData object ready for multipart/form-data uploads.
   */
  toFormData() {
    const formData = new FormData();
    this.items.forEach((item) => {
      formData.append("files", item.file);
    });
    return formData;
  }
}

export { SelectedFilesManager };
