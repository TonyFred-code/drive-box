import { dialogOpen } from "./dialog.js";

const uploadResultsDialog = document.getElementById("dialog-upload-results");
const uploadResultsStatusIcon = document.getElementById(
  "upload-results-status-icon"
);
const uploadResultsSummary = document.getElementById("upload-results-summary");
const uploadResultsStored = document.getElementById("upload-results-stored");
const uploadResultsFailed = document.getElementById("upload-results-failed");
const uploadResultsMsg = document.getElementById("upload-results-msg");
const uploadResultsStoredContainer = document.getElementById(
  "upload-results-stored-container"
);
const uploadResultsFailedContainer = document.getElementById(
  "upload-results-failed-container"
);
const uploadResultsStoredEmpty = document.getElementById(
  "upload-results-stored-empty"
);
const uploadResultsFailedEmpty = document.getElementById(
  "upload-results-failed-empty"
);
const succeededTabBtn = document.getElementById("succeeded-tab-btn");
const failedTabBtn = document.getElementById("failed-tab-btn");
const succeededCountBadge = document.getElementById("succeeded-count-badge");
const failedCountBadge = document.getElementById("failed-count-badge");

let hasSuccessfulUploads = false;
let currentFailedCount = 0;

function updateTabButtons(activeTab) {
  const activeClass =
    "flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-white text-gray-900 shadow-sm";
  const inactiveClass =
    "flex-1 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer text-gray-500 hover:text-gray-700 hover:bg-gray-50";

  if (activeTab === "succeeded") {
    succeededTabBtn.className = activeClass;
    succeededCountBadge.className =
      "px-1.5 py-0.5 rounded-full text-xs font-bold leading-none bg-emerald-100 text-emerald-800";

    failedTabBtn.className = inactiveClass;
    failedCountBadge.className =
      currentFailedCount > 0
        ? "px-1.5 py-0.5 rounded-full text-xs font-bold leading-none bg-red-100 text-red-700"
        : "px-1.5 py-0.5 rounded-full text-xs font-medium leading-none bg-gray-200 text-gray-600";
  } else {
    failedTabBtn.className = activeClass;
    failedCountBadge.className =
      currentFailedCount > 0
        ? "px-1.5 py-0.5 rounded-full text-xs font-bold leading-none bg-red-100 text-red-700"
        : "px-1.5 py-0.5 rounded-full text-xs font-medium leading-none bg-gray-200 text-gray-600";

    succeededTabBtn.className = inactiveClass;
    succeededCountBadge.className =
      "px-1.5 py-0.5 rounded-full text-xs font-medium leading-none bg-gray-200 text-gray-600";
  }
}

function showStored() {
  uploadResultsStoredContainer?.classList.remove("hidden");
  uploadResultsFailedContainer?.classList.add("hidden");
  uploadResultsDialog.dataset.activeTab = "succeeded";
  updateTabButtons("succeeded");
}

function showFailed() {
  uploadResultsStoredContainer?.classList.add("hidden");
  uploadResultsFailedContainer?.classList.remove("hidden");
  uploadResultsDialog.dataset.activeTab = "failed";
  updateTabButtons("failed");
}

succeededTabBtn?.addEventListener("click", showStored);
failedTabBtn?.addEventListener("click", showFailed);

function handleUploadResult(result) {
  const successfulUploads = Array.isArray(result?.stored) ? result.stored : [];
  const failedUploads = Array.isArray(result?.failed) ? result.failed : [];
  const msg = result?.msg || "";

  hasSuccessfulUploads = successfulUploads.length > 0;
  currentFailedCount = failedUploads.length;

  succeededCountBadge.textContent = String(successfulUploads.length);
  failedCountBadge.textContent = String(failedUploads.length);

  if (msg) {
    uploadResultsMsg.textContent = msg;
    uploadResultsMsg.classList.remove("hidden");
  } else {
    uploadResultsMsg.classList.add("hidden");
  }

  // Status icon and summary header
  if (failedUploads.length === 0) {
    uploadResultsStatusIcon.className =
      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600";
    uploadResultsStatusIcon.innerHTML = `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    `;
    uploadResultsSummary.textContent = `All ${successfulUploads.length} ${
      successfulUploads.length === 1 ? "file" : "files"
    } uploaded successfully`;
  } else if (successfulUploads.length === 0) {
    uploadResultsStatusIcon.className =
      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-red-50 text-red-600";
    uploadResultsStatusIcon.innerHTML = `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    `;
    uploadResultsSummary.textContent = `All ${failedUploads.length} ${
      failedUploads.length === 1 ? "file" : "files"
    } failed to upload`;
  } else {
    uploadResultsStatusIcon.className =
      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-50 text-amber-600";
    uploadResultsStatusIcon.innerHTML = `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    `;
    uploadResultsSummary.textContent = `${successfulUploads.length} succeeded, ${failedUploads.length} failed`;
  }

  // Populate Succeeded List or Empty State
  uploadResultsStored.innerHTML = "";
  if (successfulUploads.length > 0) {
    uploadResultsStored.classList.remove("hidden");
    uploadResultsStoredEmpty.classList.add("hidden");

    successfulUploads.forEach((f) => {
      const li = document.createElement("li");
      li.className =
        "flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 gap-3";

      const left = document.createElement("div");
      left.className = "flex items-center gap-2.5 min-w-0";

      const icon = document.createElement("div");
      icon.className =
        "w-7 h-7 rounded-lg bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0";
      icon.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`;

      const name = document.createElement("span");
      name.className = "text-xs font-semibold text-gray-800 truncate";
      name.title = f.originalName;
      name.textContent = f.originalName;

      left.appendChild(icon);
      left.appendChild(name);

      const badge = document.createElement("span");
      badge.className =
        "text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 shrink-0";
      badge.textContent = "Uploaded";

      li.appendChild(left);
      li.appendChild(badge);
      uploadResultsStored.appendChild(li);
    });
  } else {
    uploadResultsStored.classList.add("hidden");
    uploadResultsStoredEmpty.classList.remove("hidden");
  }

  // Populate Failed List or Empty State
  uploadResultsFailed.innerHTML = "";
  if (failedUploads.length > 0) {
    uploadResultsFailed.classList.remove("hidden");
    uploadResultsFailedEmpty.classList.add("hidden");

    failedUploads.forEach((f) => {
      const li = document.createElement("li");
      li.className =
        "flex flex-col p-2.5 rounded-xl bg-red-50/50 border border-red-100/80 gap-1";

      const top = document.createElement("div");
      top.className = "flex items-center justify-between gap-2";

      const left = document.createElement("div");
      left.className = "flex items-center gap-2 min-w-0";

      const icon = document.createElement("div");
      icon.className =
        "w-6 h-6 rounded-md bg-red-100 text-red-600 flex items-center justify-center shrink-0";
      icon.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`;

      const name = document.createElement("span");
      name.className = "text-xs font-semibold text-red-900 truncate";
      name.title = f.originalName;
      name.textContent = f.originalName;

      left.appendChild(icon);
      left.appendChild(name);

      const badge = document.createElement("span");
      badge.className =
        "text-[11px] font-semibold text-red-700 bg-red-100/80 px-2 py-0.5 rounded-md shrink-0";
      badge.textContent = "Failed";

      top.appendChild(left);
      top.appendChild(badge);

      const reason = document.createElement("p");
      reason.className = "text-[11px] text-red-600 pl-8";
      reason.textContent = f.reason ? `${f.reason}` : "Upload failed";

      li.appendChild(top);
      li.appendChild(reason);
      uploadResultsFailed.appendChild(li);
    });
  } else {
    uploadResultsFailed.classList.add("hidden");
    uploadResultsFailedEmpty.classList.remove("hidden");
  }

  if (successfulUploads.length > 0) {
    showStored();
  } else {
    showFailed();
  }

  dialogOpen(uploadResultsDialog);
}

uploadResultsDialog?.addEventListener("close", () => {
  if (hasSuccessfulUploads) {
    window.location.reload();
  }
});

export { handleUploadResult };
