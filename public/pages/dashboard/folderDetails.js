import { formatBytes, formatDate } from "../../lib/dashboardUtils.js";
import {
  breadcrumbs,
  children,
  currentDirectory,
  directoryStats,
  files,
  isRoot,
  user,
} from "./serverData.js";
import { uiState } from "./uiState.js";

const detailsDialog = document.getElementById("dialog-details");
const detailsContent = document.getElementById("details-content");

const viewStorageBtn = document.getElementById("view-storage-btn");

const menuCurrentDetailsBtn = document.getElementById(
  "menu-current-details-btn"
);

function showFolderDetails(folder) {
  const folderCount = directoryStats.folderCount;
  const fileCount = directoryStats.fileCount;
  const totalSize = directoryStats.totalSize;

  const statsHtml = `<span class="text-gray-800 font-medium">
        ${fileCount} file${fileCount !== 1 ? "s" : ""},
        ${folderCount} folder${folderCount !== 1 ? "s" : ""},
        ${formatBytes(totalSize)}
       </span>`;

  const parentBreadCrumbs = breadcrumbs.slice(0, breadcrumbs.length - 1);

  const parentName =
    parentBreadCrumbs && parentBreadCrumbs.length > 0
      ? `/${parentBreadCrumbs.map((b) => b.name).join("/")}/`
      : "/";

  detailsContent.innerHTML = `
    <div class="space-y-4">
      <h4 id="_fd-name" class="font-bold text-lg text-gray-900 border-b border-gray-100 pb-2"></h4>

      <div class="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2 text-xs">
        <div>
          <span class="block text-gray-400 uppercase font-semibold">Parent Folder</span>
          <span id="_fd-parent" class="text-gray-800 font-mono"></span>
        </div>
        <div>
          <span class="block text-gray-400 uppercase font-semibold">Statistics</span>
        ${statsHtml}
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3.5 rounded-xl border border-gray-200">
        <div>
          <span class="block text-gray-400 uppercase font-semibold">Modified</span>
          <span class="text-gray-800 font-medium">${formatDate(folder.updatedAt)}</span>
        </div>
        <div>
          <span class="block text-gray-400 uppercase font-semibold">Created</span>
          <span class="text-gray-800 font-medium">${formatDate(folder.createdAt)}</span>
        </div>
      </div>
    </div>
  `;

  // Set user-controlled values via textContent after the skeleton is in the DOM
  detailsContent.querySelector("#_fd-name").textContent = folder.name;
  detailsContent.querySelector("#_fd-parent").textContent = parentName;

  detailsDialog.showModal();
}

function showRootDetails() {
  const isCurrentDirectory = currentDirectory.id === user.rootDirectoryId;

  const folderCount = directoryStats.folderCount;
  const fileCount = directoryStats.fileCount;
  const totalSize = directoryStats.totalSize;

  const statsHtml = `<span class="text-gray-800 font-medium">
        ${fileCount} file${fileCount !== 1 ? "s" : ""},
        ${folderCount} folder${folderCount !== 1 ? "s" : ""},
        ${formatBytes(totalSize)}
       </span>`;

  const usedStorage = user.storageUsed;
  const availableStorage = user.storageQuota - user.storageUsed;
  const usedStoragePercent = (usedStorage / user.storageQuota) * 100;

  detailsContent.innerHTML = `
    <div class="space-y-4">
      <h4 class="font-bold text-lg text-gray-900 border-b border-gray-100 pb-2">My Box</h4>
      
      <div class="space-y-1.5 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
        <div class="flex justify-between text-xs font-semibold text-gray-600">
          <span>Storage</span>
          <span>${usedStoragePercent.toFixed(0)}% (${formatBytes(user.storageUsed)} of ${formatBytes(user.storageQuota)} used)</span>
        </div>
        <div class="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div class="storage-progress-bar h-full bg-emerald-500 rounded-full" style="width: ${usedStoragePercent.toFixed(0)}%"></div>
        </div>
      </div>

      <hr class="border-gray-200" />
      ${
        isCurrentDirectory
          ? `<div>
          <span class="block text-gray-400 uppercase font-semibold">Statistics</span>
          ${statsHtml}
        </div>
  
        <hr class="border-gray-200" />`
          : ""
      }



      <div class="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3.5 rounded-xl border border-gray-200">
        <div>
          <span class="block text-gray-400 uppercase font-semibold">Modified</span>
          <span class="text-gray-800 font-medium">${formatDate(currentDirectory.updatedAt)}</span>
        </div>
        <div>
          <span class="block text-gray-400 uppercase font-semibold">Created</span>
          <span class="text-gray-800 font-medium">${formatDate(currentDirectory.createdAt)}</span>
        </div>
      </div>
    </div>
  `;
  detailsDialog.showModal();
}

menuCurrentDetailsBtn?.addEventListener("click", () => {
  if (isRoot) {
    showRootDetails();
  } else {
    showFolderDetails(currentDirectory);
  }
});

// Storage details button in profile
viewStorageBtn?.addEventListener("click", () => {
  showRootDetails();
});
