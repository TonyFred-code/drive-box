import "./deleteFile.js";
import "./deleteFolder.js";
import {
  closeFileContextMenu,
  fileContextMenuIsOpen,
  showFileContextMenu,
} from "./fileContextMenu.js";
import "./fileDetails.js";
import "./fileUpload.js";
import {
  closeFolderContextMenu,
  folderContextMenuIsOpen,
  showFolderContextMenu,
} from "./folderContextMenu.js";
import "./folderDetails.js";
import "./newFolder.js";
import "./pageMenu.js";
import { closeProfileMenu, profileMenuIsOpen } from "./profileMenu.js";
import "./renameFile.js";
import "./renameFolder.js";
import "./sortAssets.js";
import { uiState } from "./uiState.js";

function closeAllMenus() {
  closeFolderContextMenu();
  closeFileContextMenu();
  closeProfileMenu();
}
function closeAllDialogs() {
  document.querySelectorAll("dialog[open]").forEach((d) => d.close());
}

// Attach generic close buttons for dialogs
document.querySelectorAll(".dialog-cancel-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const dialog = e.target.closest("dialog");
    if (dialog) dialog.close();
  });
});

// Close dialog on outside click
document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });
});

document.querySelectorAll(".item-menu-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const folderCard = btn.closest(".folder-card");

    if (folderCard) {
      if (folderContextMenuIsOpen()) {
        closeFolderContextMenu();
      } else {
        uiState.activeContextMenuFolder = {
          id: folderCard.dataset.id,
          name: folderCard.dataset.name,
          createdAt: folderCard.dataset.createdAt,
          updatedAt: folderCard.dataset.updatedAt,
        };
        showFolderContextMenu(btn, folderCard);
        closeFileContextMenu();
        return;
      }
    }

    const fileCard = btn.closest(".file-card");

    if (fileCard) {
      if (fileContextMenuIsOpen()) {
        closeFileContextMenu();
      } else {
        uiState.activeContextMenuFile = {
          id: fileCard.dataset.id,
          name: fileCard.dataset.name,
          createdAt: fileCard.dataset.createdAt,
          updatedAt: fileCard.dataset.updatedAt,
        };
        showFileContextMenu(fileCard, btn);
        closeFolderContextMenu();
      }
    }
  });
});

// Close context menus on outside click
document.addEventListener("click", () => {
  closeAllMenus();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeAllMenus();
    closeAllDialogs();
  }
});
