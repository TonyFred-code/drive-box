import { uiState } from "./uiState.js";

const fileContextMenu = document.getElementById("file-context-menu");
const ctxViewLink = document.getElementById("ctx-view");
const ctxDownloadLink = document.getElementById("ctx-download");
const ctxDeleteFileBtn = document.getElementById("ctx-delete-file");

function showFileContextMenu(card, btn) {
  // Calculate position
  const rect = btn.getBoundingClientRect();
  const menuWidth = 176;
  let left = rect.right - menuWidth;
  let top = rect.bottom + 6;

  if (left < 10) left = 10;
  if (top + 160 > window.innerHeight) {
    top = rect.top - 160;
  }

  const viewUrl = `${window.location.origin}/files/${uiState.activeContextMenuFile.id}/view`;
  const downloadUrl = `${window.location.origin}/files/${uiState.activeContextMenuFile.id}/download`;

  ctxViewLink.href = viewUrl;
  ctxDownloadLink.href = downloadUrl;

  fileContextMenu.style.left = `${left}px`;
  fileContextMenu.style.top = `${top}px`;
  fileContextMenu.classList.remove("hidden");
}

function closeFileContextMenu() {
  fileContextMenu.classList.add("hidden");
}

ctxDeleteFileBtn?.addEventListener("click", () => {
  if (!uiState.activeContextMenuFile) return;

  deleteFileSummary.textContent = `Are you sure you want to delete "${uiState.activeContextMenuFile.name}"?`;
  deleteFileDialod.showModal();
});

function fileContextMenuIsOpen() {
  return !fileContextMenu.classList.contains("hidden");
}

export { closeFileContextMenu, fileContextMenuIsOpen, showFileContextMenu };
