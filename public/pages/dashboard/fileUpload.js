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

function openFileUploadDialog() {
  dialogOpen(fileUploadDialog);
  uploadBtn.disabled = uiState.selectedFiles.length === 0;
  uploadBtn.textContent = "upload";
}

emptyUploadBtn?.addEventListener("click", openFileUploadDialog);
menuUploadBtn?.addEventListener("click", openFileUploadDialog);

function displaySelectedFilesOverview(files) {
  selectedFilesOverview.innerHTML = "";

  const totalFiles = files.length;
  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

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

  viewSelectedFilesBtn.disabled = files.length === 0;
  fileList.classList.remove("hidden");
}

function hideSelectedFilesOverview() {
  selectedFilesOverview.innerHTML = "";
  fileList.classList.add("hidden");
}

function removeFile(fileIndex) {
  if (!uiState.selectedFiles[fileIndex]) return;

  uiState.selectedFiles.splice(fileIndex, 1);
  displaySelectedFilesOverview(uiState.selectedFiles);
  displaySelectedFiles(uiState.selectedFiles);

  const dt = new DataTransfer();
  uiState.selectedFiles.forEach((file) => dt.items.add(file));
  fileUploadInput.files = dt.files;

  if (uiState.selectedFiles.length === 0) {
    dialogClose(selectedFilesDialog);
    hideSelectedFilesOverview();
    uploadBtn.disabled = true;
  }
}

function displaySelectedFiles(files) {
  selectedFilesDetails.innerHTML = "";

  files.forEach((file, index) => {
    const fileItem = document.createElement("div");
    fileItem.className =
      "flex items-center justify-between bg-white border border-gray-200 rounded-lg shadow-sm p-3 mb-2 gap-4";

    const fileName = document.createElement("span");
    fileName.className =
      "file-name font-medium text-gray-800 truncate max-w-[20rem]";
    fileName.textContent = file.name;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className =
      "remove-file text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300 font-bold text-lg p-3 cursor-pointer";
    removeBtn.dataset.fileIndex = index;
    removeBtn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeFile(index);
    });

    fileItem.appendChild(fileName);
    fileItem.appendChild(removeBtn);
    selectedFilesDetails.appendChild(fileItem);
  });
}

fileUploadInput?.addEventListener("change", () => {
  if (fileUploadInput.files && fileUploadInput.files.length > 0) {
    uiState.selectedFiles = [
      ...uiState.selectedFiles,
      ...Array.from(fileUploadInput.files),
    ];
    displaySelectedFilesOverview(uiState.selectedFiles);
  }

  uploadBtn.disabled = fileUploadInput.files.length === 0;
});

viewSelectedFilesBtn?.addEventListener("click", () => {
  if (uiState.selectedFiles && uiState.selectedFiles.length > 0) {
    displaySelectedFiles(uiState.selectedFiles);
    dialogOpen(selectedFilesDialog);
  }
});

async function handleUploadFile(e) {
  e.preventDefault();
  if (uiState.selectedFiles.length === 0) return;

  uploadBtn.disabled = true;
  uploadBtn.textContent = "Uploading...";

  const formData = new FormData();
  uiState.selectedFiles.forEach((file) => formData.append("files", file));

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
        uiState.selectedFiles.length > 0
      ) {
        failed = uiState.selectedFiles.map((file) => ({
          originalName: file.name,
          reason: "Upload rejected",
        }));
      }

      handleUploadResult({ stored, failed, msg });
      return;
    }

    if (!response.ok) {
      const errorMsg =
        data?.error?.[0]?.msg || "Failed to upload files. Please try again.";
      handleUploadResult({
        stored: [],
        failed: uiState.selectedFiles.map((file) => ({
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
      failed: uiState.selectedFiles.map((file) => ({
        originalName: file.name,
        reason: error.message || "Network error. Please try again.",
      })),
    });
  } finally {
    dialogClose(fileUploadDialog);
  }
}

function resetFileUpload() {
  uiState.selectedFiles = [];
  displaySelectedFilesOverview(uiState.selectedFiles);
  displaySelectedFiles(uiState.selectedFiles);
  fileUploadInput.value = "";
  uploadBtn.disabled = true;
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
