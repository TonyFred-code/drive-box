import {
  extractFileExtension,
  extractFileNameWithoutExt,
  validateFileName,
} from "../../lib/dashboardUtils.js";
import { uiState } from "./uiState.js";

const renameFileDialog = document.getElementById("dialog-rename-file");
const renameFileNameInput = document.getElementById("rename-file-name-input");
const renameFileError = document.getElementById("rename-file-error");
const renameFileCharCount = document.getElementById("rename-file-char-count");
const renameFileForm = document.getElementById("rename-file-form");
const renameFileIdInput = document.getElementById("rename-file-id");
const renameFileFullNameInput = document.getElementById("file-full-name");
const renameFileExtensionElm = document.getElementById("rename-file-extension");
const renameFileSubmitBtn = renameFileForm.querySelector("button[type=submit]");

const ctxRenameFileBtn = document.getElementById("ctx-rename-file");

function openRenameFileDialog(file) {
  const fileNameWithoutExt = extractFileNameWithoutExt(file.name);
  const fileExt = extractFileExtension(file.name);

  renameFileDialog.classList.remove("hidden");
  renameFileIdInput.value = file.id;
  renameFileNameInput.value = fileNameWithoutExt;
  renameFileFullNameInput.value = file.name;
  renameFileCharCount.textContent = `${fileNameWithoutExt.length}/32`;
  renameFileError.classList.add("hidden");

  renameFileExtensionElm.textContent = fileExt;

  renameFileNameInput.focus();
  renameFileNameInput.select();

  renameFileDialog.showModal();
}

renameFileNameInput.addEventListener("input", () => {
  const newFilename = renameFileNameInput.value;
  const length = newFilename.length;

  renameFileCharCount.textContent = `${length}/32`;

  const { valid, message } = validateFileName(newFilename);

  if (!valid) {
    renameFileError.textContent = message;
    renameFileError.classList.remove("hidden");
  } else {
    renameFileError.classList.add("hidden");
  }
});

/**
 * Handles the submission of the rename file form.
 * @param {Event} e The event object.
 */
async function handleRenameFileSubmit(e) {
  e.preventDefault();

  const { valid, message } = validateFileName(renameFileNameInput.value);

  if (!valid) {
    renameFileError.textContent = message;
    renameFileError.classList.remove("hidden");
    return;
  }

  renameFileSubmitBtn.disabled = true;
  renameFileSubmitBtn.textContent = "Renaming...";

  try {
    const response = await fetch(`/files/${renameFileIdInput.value}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: `${renameFileNameInput.value}${renameFileExtensionElm.textContent}`,
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      let errMsg =
        result?.error[0]?.msg ||
        result?.message ||
        "Failed to update file name";

      switch (result?.error[0]?.code) {
        case "FILE_NOT_FOUND":
          errMsg = "File not found.";
          break;
        case "UNAUTHORIZED":
          errMsg = "Unauthorized to update file.";
          break;
        case "UNIQUE_CONSTRAINT_VIOLATION":
          errMsg = "A file with this name already exists in the current box.";
          break;
      }

      renameFileError.textContent = errMsg;
      renameFileError.classList.remove("hidden");
      renameFileSubmitBtn.disabled = false;
      renameFileSubmitBtn.textContent = "retry";
      return;
    }

    window.location.reload();
  } catch (error) {
    console.error("Error renaming file:", error);
    renameFileError.textContent = "Network error. Please try again.";
    renameFileError.classList.remove("hidden");
    renameFileSubmitBtn.disabled = false;
    renameFileSubmitBtn.textContent = "retry";
  }
}

renameFileForm.addEventListener("submit", handleRenameFileSubmit);

ctxRenameFileBtn?.addEventListener("click", () => {
  if (!uiState.activeContextMenuFile) return;

  openRenameFileDialog(uiState.activeContextMenuFile);
});
