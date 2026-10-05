import { formatBytes } from "../../lib/dashboardUtils.js";
import { dialogClose, dialogOpen } from "./dialog.js";
import { handleUploadResult } from "./fileUploadDetails.js";
import { currentDirectory, user } from "./serverData.js";
import { uiState } from "./uiState.js";

const emptyUploadBtn = document.getElementById("empty-upload-btn");
const menuUploadBtn = document.getElementById("menu-upload-btn");

const fileUploadDialog = document.getElementById("dialog-upload");
const uploadForm = document.getElementById("upload-form");
const uploadBtn = document.getElementById("upload-btn");
const cancelUploadBtn = document.getElementById("cancel-btn");
const fileUploadInput = document.getElementById("file-upload-input");
const fileList = document.getElementById("selected-files-list");
const selectedFilesDialog = document.getElementById("dialog-selected-files");
const viewSelectedFilesBtn = document.getElementById("view-selected-files-btn");
const removeAllFilesBtn = document.getElementById("remove-all-files-btn");
const selectedFilesDetails = document.getElementById("selected-files-details");
const selectedFilesOverview = document.getElementById(
  "selected-files-overview"
);
const uploadWarningBanner = document.getElementById("upload-warning-banner");
const clearInvalidBtn = document.getElementById("clear-invalid");

function openFileUploadDialog() {
  dialogOpen(fileUploadDialog);
  uploadBtn.disabled = uiState.selectedFilesManager.isEmpty();
  uploadBtn.textContent = "Upload";
}

emptyUploadBtn?.addEventListener("click", openFileUploadDialog);
menuUploadBtn?.addEventListener("click", openFileUploadDialog);

function displaySelectedFilesOverview() {
  selectedFilesOverview.innerHTML = "";

  const totalFiles = uiState.selectedFilesManager.count;
  const totalSize = uiState.selectedFilesManager.totalSize;

  selectedFilesOverview.innerHTML = `
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-gray-600">Total files</span>
        <span class="font-medium text-gray-900">${totalFiles}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-gray-600">Total size</span>
        <span class="font-medium text-gray-900">${formatBytes(totalSize)}</span>
      </div>
    </div>
  `;

  fileList.classList.remove("hidden");
}

function hideSelectedFilesOverview() {
  selectedFilesOverview.innerHTML = "";
  fileList.classList.add("hidden");
}

function displaySelectedFiles(items) {
  selectedFilesDetails.innerHTML = "";

  items.forEach((item) => {
    const fileItem = document.createElement("div");
    fileItem.className = `flex items-center justify-between rounded-xl p-3 mb-2 gap-4 border transition-colors ${
      item.isValid
        ? "bg-white border-gray-200 shadow-sm"
        : "bg-red-50/70 border-red-200"
    }`;

    const fileNameContainer = document.createElement("div");
    fileNameContainer.className = "flex flex-col min-w-0";

    const topRow = document.createElement("div");
    topRow.className = "flex items-center gap-2 min-w-0";

    const fileName = document.createElement("span");
    fileName.className =
      "file-name font-medium text-gray-800 truncate max-w-[18rem]";
    fileName.textContent = item.file.name;
    fileName.title = item.file.name;

    const fileSize = document.createElement("span");
    fileSize.className = "text-xs text-gray-400 shrink-0 font-normal";
    fileSize.textContent = `(${formatBytes(item.file.size)})`;

    topRow.appendChild(fileName);
    topRow.appendChild(fileSize);
    fileNameContainer.appendChild(topRow);

    if (!item.isValid) {
      const errorMsg = document.createElement("p");
      errorMsg.className =
        "text-xs text-red-600 font-medium mt-1 leading-snug break-words max-w-[20rem]";
      errorMsg.textContent = item.error || "Invalid file";
      fileNameContainer.appendChild(errorMsg);
    }

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className =
      "remove-file text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300 font-bold text-lg p-3 cursor-pointer shrink-0";
    removeBtn.dataset.id = item.id;
    removeBtn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      uiState.selectedFilesManager.removeById(item.id);
      displaySelectedFiles(uiState.selectedFilesManager.items);
      displaySelectedFilesOverview();
      uploadBtn.disabled = uiState.selectedFilesManager.isEmpty();

      if (!uiState.selectedFilesManager.hasErrors) {
        hideWarningBanner();
      } else {
        const reason =
          uiState.selectedFilesManager.batchError ||
          `${uiState.selectedFilesManager.invalidCount} file(s) have errors.`;
        showWarningBanner(reason);
        uploadBtn.disabled = true;
      }

      if (uiState.selectedFilesManager.isEmpty()) {
        dialogClose(selectedFilesDialog);
        hideSelectedFilesOverview();
      }
    });

    fileItem.appendChild(fileNameContainer);
    fileItem.appendChild(removeBtn);
    selectedFilesDetails.appendChild(fileItem);
  });

  if (uiState.selectedFilesManager.invalidCount > 0) {
    clearInvalidBtn.classList.remove("hidden");
  } else {
    clearInvalidBtn.classList.add("hidden");
  }
}

fileUploadInput?.addEventListener("change", () => {
  if (fileUploadInput.files && fileUploadInput.files.length > 0) {
    uiState.selectedFilesManager.addFiles(fileUploadInput.files);
    displaySelectedFiles(uiState.selectedFilesManager.items);
    displaySelectedFilesOverview();

    if (uiState.selectedFilesManager.hasErrors) {
      const reason =
        uiState.selectedFilesManager.batchError ||
        `${uiState.selectedFilesManager.invalidCount} file(s) have errors.`;
      showWarningBanner(reason);
      updateBtn.disabled = true;
    } else {
      hideWarningBanner();
    }
  }

  uploadBtn.disabled = uiState.selectedFilesManager.isEmpty();
  fileUploadInput.value = "";
});

viewSelectedFilesBtn?.addEventListener("click", () => {
  if (!uiState.selectedFilesManager.isEmpty()) {
    displaySelectedFiles(uiState.selectedFilesManager.items);
    dialogOpen(selectedFilesDialog);
  }
});

function showWarningBanner(reason) {
  uploadWarningBanner.classList.remove("hidden");
  uploadWarningBanner.textContent = `${reason} Click 'View selected files' below to review.`;
}

function hideWarningBanner() {
  uploadWarningBanner.classList.add("hidden");
}

async function handleUploadFile(e) {
  e.preventDefault();
  if (uiState.selectedFilesManager.isEmpty()) return;

  if (uiState.selectedFilesManager.hasErrors) {
    const reason =
      uiState.selectedFilesManager.batchError ||
      `${uiState.selectedFilesManager.invalidCount} file(s) have errors.`;
    showWarningBanner(reason);
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload";
    return;
  } else {
    hideWarningBanner();
  }

  uploadBtn.disabled = true;
  uploadBtn.textContent = "Uploading...";

  const formData = uiState.selectedFilesManager.toFormData();
  const currentDirectoryId = currentDirectory?.id || user.rootDirectoryId;
  formData.set("directoryId", currentDirectoryId);

  try {
    const response = await fetch("/files/upload", {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });
    const data = await response.json();

    if (
      data?.data &&
      (Array.isArray(data.data.stored) || Array.isArray(data.data.failed))
    ) {
      const stored = data.data.stored || [];
      let failed = data.data.failed || [];
      const msg = data.data.msg || "";

      if (
        stored.length === 0 &&
        failed.length === 0 &&
        !uiState.selectedFilesManager.isEmpty()
      ) {
        failed = uiState.selectedFilesManager.allFiles.map((file) => ({
          originalName: file.name,
          reason: "Upload rejected",
        }));
      }

      handleUploadResult({ stored, failed, msg });
      return;
    }

    if (!response.ok) {
      const errorMsg =
        data?.error?.[0]?.msg ||
        data?.msg ||
        "Failed to upload files. Please try again.";
      handleUploadResult({
        stored: [],
        failed: uiState.selectedFilesManager.allFiles.map((file) => ({
          originalName: file.name,
          reason: "Upload failed.",
        })),
        msg: errorMsg,
      });
      return;
    }

    throw new Error("Unexpected response format. Please try again.");
  } catch (error) {
    handleUploadResult({
      stored: [],
      failed: uiState.selectedFilesManager.allFiles.map((file) => ({
        originalName: file.name,
        reason: error.message || "Network error. Please try again.",
      })),
    });
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload";
    dialogClose(fileUploadDialog);
  }
}

function resetFileUpload() {
  uiState.selectedFilesManager.clear();
  hideSelectedFilesOverview();
  fileUploadInput.value = "";
  uploadBtn.disabled = true;
  hideWarningBanner();
  fileList.classList.add("hidden");
}

removeAllFilesBtn?.addEventListener("click", () => {
  dialogClose(selectedFilesDialog);
  resetFileUpload();
});

// Submit the upload form with Enter when files are ready
fileUploadDialog?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !uploadBtn.disabled) {
    e.preventDefault();
    uploadForm.requestSubmit();
  }
});

uploadForm?.addEventListener("submit", handleUploadFile);

fileUploadDialog?.addEventListener("close", () => {
  resetFileUpload();
});

clearInvalidBtn?.addEventListener("click", () => {
  uiState.selectedFilesManager.removeInvalid();
  hideWarningBanner();

  if (uiState.selectedFilesManager.isEmpty()) {
    dialogClose(selectedFilesDialog);
    hideSelectedFilesOverview();
    uploadBtn.disabled = true;
  } else {
    displaySelectedFiles(uiState.selectedFilesManager.items);
    displaySelectedFilesOverview();
  }
});

selectedFilesDialog?.addEventListener("close", () => {
  if (uiState.selectedFilesManager.hasErrors) {
    const reason =
      uiState.selectedFilesManager.batchError ||
      `${uiState.selectedFilesManager.invalidCount} file(s) have errors.`;
    showWarningBanner(reason);
    uploadBtn.disabled = true;
  } else {
    hideWarningBanner();
    uploadBtn.disabled = false;
  }
});
