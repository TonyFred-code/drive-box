import { formatDate } from "../../lib/dashboardUtils.js";
import { breadcrumbs, currentDirectory, isRoot } from "./serverData.js";
import { uiState } from "./uiState.js";

const detailsDialog = document.getElementById("dialog-details");
const detailsContent = document.getElementById("details-content");

const ctxDetailsBtn = document.getElementById("ctx-details");

const viewStorageBtn = document.getElementById("view-storage-btn");

const menuCurrentDetailsBtn = document.getElementById(
  "menu-current-details-btn"
);

function showFolderDetails(folder) {
  const parentBreadCrumbs =
    folder.id === currentDirectory.id
      ? breadcrumbs.slice(0, breadcrumbs.length - 1)
      : breadcrumbs;

  const parentName =
    parentBreadCrumbs && parentBreadCrumbs.length > 0
      ? `/${parentBreadCrumbs.map((b) => b.name).join("/")}/`
      : "/";

  detailsContent.innerHTML = `
    <div class="space-y-4">
      <h4 class="font-bold text-lg text-gray-900 border-b border-gray-100 pb-2">${folder.name}</h4>

      <div class="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2 text-xs">
        <div>
          <span class="block text-gray-400 uppercase font-semibold">Parent Folder</span>
          <span class="text-gray-800 font-mono">${parentName}</span>
        </div>
        <div>
          <span class="block text-gray-400 uppercase font-semibold">Statistics</span>
          <span class="text-gray-800 font-medium">Directory item</span>
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
  detailsDialog.showModal();
}

function showRootDetails() {
  detailsContent.innerHTML = `
    <div class="space-y-4">
      <h4 class="font-bold text-lg text-gray-900 border-b border-gray-100 pb-2">My Box</h4>
      
      <div class="space-y-1.5 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
        <div class="flex justify-between text-xs font-semibold text-gray-600">
          <span>Storage</span>
          <span>18% (46MB of 256MB used)</span>
        </div>
        <div class="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div class="storage-progress-bar h-full bg-emerald-500 rounded-full" style="width: 18%"></div>
        </div>
      </div>

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

ctxDetailsBtn?.addEventListener("click", () => {
  if (uiState.activeContextMenuFolder) {
    showFolderDetails(uiState.activeContextMenuFolder);
  }
});
