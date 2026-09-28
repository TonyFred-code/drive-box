import { uiState } from "./uiState.js";

const folderContextMenu = document.getElementById("folder-context-menu");
const ctxOpenFolderLink = document.getElementById("ctx-open-folder");

function closeFolderContextMenu() {
  folderContextMenu.classList.add("hidden");
}

function showFolderContextMenu(btn, card) {
  // Calculate position
  const rect = btn.getBoundingClientRect();
  const menuWidth = 176;
  let left = rect.right - menuWidth;
  let top = rect.bottom + 6;

  if (left < 10) left = 10;
  if (top + 160 > window.innerHeight) {
    top = rect.top - 160;
  }

  folderContextMenu.style.left = `${left}px`;
  folderContextMenu.style.top = `${top}px`;

  ctxOpenFolderLink.href = `/dashboard?directoryId=${encodeURIComponent(uiState.activeContextMenuFolder.id)}`;

  folderContextMenu.classList.remove("hidden");
}

function folderContextMenuIsOpen() {
  return !folderContextMenu.classList.contains("hidden");
}

export {
  closeFolderContextMenu,
  folderContextMenuIsOpen,
  showFolderContextMenu,
};
