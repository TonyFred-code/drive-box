import { formatBytes, formatDate } from "../../lib/dashboardUtils.js";
import { files } from "./serverData.js";
import { uiState } from "./uiState.js";

const fileDetailsDialog = document.getElementById("dialog-file-details");
const fileDetails = document.getElementById("file-details");

const ctxFileDetailsBtn = document.getElementById("ctx-file-details");

function displayFileDetails(file) {
  const fileId = file.id;
  const fileData = files.find((f) => f.id === fileId);

  if (!fileData) return;

  fileDetails.innerHTML = `
    <div class="space-y-2">
      <p><span class="font-medium">Name:</span> ${fileData.name}</p>
      <p><span class="font-medium">Size:</span> ${formatBytes(fileData.size)}</p>
      <p><span class="font-medium">Type:</span> ${fileData.mimeType}</p>
      <p><span class="font-medium">Created at:</span> ${formatDate(fileData.createdAt)}</p>
      <p><span class="font-medium">Updated at:</span> ${formatDate(fileData.updatedAt)}</p>
    </div>
  `;

  fileDetailsDialog.showModal();
}

ctxFileDetailsBtn?.addEventListener("click", () => {
  debugger;
  if (!uiState.activeContextMenuFile) return;

  displayFileDetails(uiState.activeContextMenuFile);
});
