import { formatBytes } from "../../lib/dashboardUtils.js";
import { dialogClose, dialogOpen } from "./dialog.js";
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
const uploadErrorMsgElm = document.getElementById("upload-error-msg");
const uploadErrorDetails = document.getElementById("upload-error-details");
const uploadErrorDialog = document.getElementById("dialog-upload-error");

const uploadResultsDialog = document.getElementById("dialog-upload-results");
const uploadResultsSummary = document.getElementById("upload-results-summary");
const uploadResultsStored = document.getElementById("upload-results-stored");
const uploadResultsFailed = document.getElementById("upload-results-failed");

function openFileUploadDialog() {
  dialogOpen(fileUploadDialog);
  uploadBtn.disabled = true;
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
  }
}

function displaySelectedFiles(files) {
  selectedFilesDetails.innerHTML = "";

  files.forEach((file, index) => {
    const fileItem = document.createElement("div");
    fileItem.className =
      "flex items-center justify-between bg-white border border-gray-200 rounded-lg shadow-sm p-3 mb-2";

    const metaWrapper = document.createElement("div");
    metaWrapper.className = "flex flex-col";

    const nameSpan = document.createElement("span");
    nameSpan.className =
      "file-name font-medium text-gray-800 truncate max-w-[20rem]";
    nameSpan.textContent = file.name;
    metaWrapper.appendChild(nameSpan);

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

    fileItem.appendChild(metaWrapper);
    fileItem.appendChild(removeBtn);
    selectedFilesDetails.appendChild(fileItem);
  });
}

fileUploadInput?.addEventListener("change", () => {
  if (fileUploadInput.files && fileUploadInput.files.length > 0) {
    uiState.selectedFiles = Array.from(fileUploadInput.files);
    displaySelectedFilesOverview(uiState.selectedFiles);
  }

  uploadBtn.disabled = fileUploadInput.files.length === 0;
});

viewSelectedFilesBtn?.addEventListener("click", () => {
  if (fileUploadInput.files && fileUploadInput.files.length > 0) {
    uiState.selectedFiles = Array.from(fileUploadInput.files);
    displaySelectedFiles(uiState.selectedFiles);
    dialogOpen(selectedFilesDialog);
  }
});

function handleUploadError(error, result = null) {
  console.error("Error uploading files:", error);

  if (error.length === 0) return;

  const errorMsg =
    error[0]?.msg || "Failed to upload all files. Please try again.";
  uploadErrorMsgElm.textContent = errorMsg;

  uploadErrorDetails.innerHTML = "";

  if (result && Array.isArray(result.failed) && result.failed.length > 0) {
    const heading = document.createElement("p");
    heading.className = "text-gray-700 mb-2";
    heading.innerHTML = "<strong>Failed Uploads:</strong>";
    uploadErrorDetails.appendChild(heading);

    const ul = document.createElement("ul");
    ul.className = "space-y-1";

    result.failed.forEach((f) => {
      const li = document.createElement("li");
      li.className = "flex flex-col";

      const nameLine = document.createElement("p");
      const nameLabel = document.createElement("strong");
      nameLabel.textContent = f.originalName;
      nameLine.append("Name: ", nameLabel);

      const reasonLine = document.createElement("p");
      reasonLine.className = "text-gray-600";
      reasonLine.textContent = `Reason: ${f.reason}`;

      li.appendChild(nameLine);
      li.appendChild(reasonLine);
      ul.appendChild(li);
    });

    uploadErrorDetails.appendChild(ul);
  }

  dialogOpen(uploadErrorDialog);
}

function handleUploadResult(result) {
  const successfulUploads = result.stored;
  const failedUploads = result.failed;

  const summaryText = ``;

  uploadResultsSummary.textContent = summaryText;

  uploadResultsStored.innerHTML = "";
  const storedHeading = document.createElement("p");
  storedHeading.className = "text-gray-700 mb-2";
  storedHeading.innerHTML = "<strong>Stored:</strong>";
  uploadResultsStored.appendChild(storedHeading);

  const storedUl = document.createElement("ul");
  storedUl.className = "space-y-1";
  successfulUploads.forEach((f) => {
    const li = document.createElement("li");
    li.className = "flex flex-col";
    const nameLine = document.createElement("p");
    const nameLabel = document.createElement("strong");
    nameLabel.textContent = f.originalName;
    nameLine.append("Name: ", nameLabel);
    li.appendChild(nameLine);
    storedUl.appendChild(li);
  });
  uploadResultsStored.appendChild(storedUl);

  uploadResultsFailed.innerHTML = "";
  const failedHeading = document.createElement("p");
  failedHeading.className = "text-gray-700 mb-2";
  failedHeading.innerHTML = "<strong>Failed:</strong>";
  uploadResultsFailed.appendChild(failedHeading);

  const failedUl = document.createElement("ul");
  failedUl.className = "space-y-1";
  failedUploads.forEach((f) => {
    const li = document.createElement("li");
    li.className = "flex flex-col";
    const nameLine = document.createElement("p");
    const nameLabel = document.createElement("strong");
    nameLabel.textContent = f.originalName;
    nameLine.append("Name: ", nameLabel);
    const reasonLine = document.createElement("p");
    reasonLine.className = "text-gray-600";
    reasonLine.textContent = `Reason: ${f.reason}`;
    li.appendChild(nameLine);
    li.appendChild(reasonLine);
    failedUl.appendChild(li);
  });
  uploadResultsFailed.appendChild(failedUl);

  dialogOpen(uploadResultsDialog);
}

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
    });
    const data = await response.json();

    if (!response.ok) {
      handleUploadError(data.error, data?.data ?? null);
      return;
    }

    if (data.success) {
      handleUploadResult(data.data);
    }
  } catch (error) {
    handleUploadError(error);
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload";
  }
}

removeAllFilesBtn?.addEventListener("click", () => {
  uiState.selectedFiles = [];
  displaySelectedFilesOverview(uiState.selectedFiles);
  displaySelectedFiles(uiState.selectedFiles);
  fileUploadInput.value = "";
  dialogClose(selectedFilesDialog);
  fileList.classList.add("hidden");
});

// Submit the upload form with Enter when files are ready
fileUploadDialog?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !uploadBtn.disabled) {
    e.preventDefault();
    uploadForm.requestSubmit();
  }
});

uploadResultsDialog?.addEventListener("close", () => window.location.reload());

uploadForm?.addEventListener("submit", handleUploadFile);
