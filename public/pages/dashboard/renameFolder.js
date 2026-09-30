import { validateFolderName } from "../../lib/dashboardUtils.js";
import { dialogOpen } from "./dialog.js";
import { breadcrumbs, currentDirectory } from "./serverData.js";
import { uiState } from "./uiState.js";

const menuRenameCurrentBtn = document.getElementById("menu-rename-current-btn");

const ctxRenameBtn = document.getElementById("ctx-rename");

const renameFolderDialog = document.getElementById("dialog-rename-folder");
const renameFolderForm = document.getElementById("rename-folder-form");
const renameFolderIdInput = document.getElementById("rename-folder-id");
const renameFolderNameInput = document.getElementById(
  "rename-folder-name-input"
);
const renameFolderError = document.getElementById("rename-folder-error");
const renameFolderCharCount = document.getElementById(
  "rename-folder-char-count"
);

function openRenameFolderDialog(folderId, currentName) {
  renameFolderIdInput.value = folderId;
  renameFolderNameInput.value = currentName;
  renameFolderCharCount.textContent = `${currentName.length}/32`;
  renameFolderError.classList.add("hidden");
  dialogOpen(renameFolderDialog);
  renameFolderNameInput.focus();
  renameFolderNameInput.select();
}

renameFolderNameInput?.addEventListener("input", () => {
  const value = renameFolderNameInput.value;
  renameFolderCharCount.textContent = `${value.length}/32`;

  const { valid, message } = validateFolderName(value);
  if (!valid) {
    renameFolderError.textContent = message;
    renameFolderError.classList.remove("hidden");
  } else {
    renameFolderError.classList.add("hidden");
  }
});

renameFolderForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const folderId = renameFolderIdInput.value;
  const name = renameFolderNameInput.value.trim();

  const { valid, message } = validateFolderName(name);

  if (!valid) {
    renameFolderError.textContent = message;
    renameFolderError.classList.remove("hidden");
    return;
  }

  try {
    const res = await fetch(`/directories/${encodeURIComponent(folderId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const result = await res.json();

    if (!res.ok) {
      let errMsg =
        result.error?.[0]?.msg || result.message || "Failed to rename folder";

      if (res.status === 409) {
        if (folderId === currentDirectory?.id) {
          const parentCrumb =
            breadcrumbs && breadcrumbs.length >= 3
              ? breadcrumbs[breadcrumbs.length - 2]
              : null;
          errMsg = parentCrumb
            ? `A directory with this name already exists in the parent directory ("${parentCrumb.name}")`
            : "A directory with this name already exists in your home directory";
        } else {
          errMsg =
            "A directory with this name already exists in this directory";
        }
      }

      renameFolderError.textContent = errMsg;
      renameFolderError.classList.remove("hidden");
      return;
    }

    // Success
    window.location.reload();
  } catch (err) {
    renameFolderError.textContent = "Network error. Please try again.";
    renameFolderError.classList.remove("hidden");
  }
});

menuRenameCurrentBtn?.addEventListener("click", () => {
  openRenameFolderDialog(currentDirectory.id, currentDirectory.name);
});

ctxRenameBtn?.addEventListener("click", () => {
  if (uiState.activeContextMenuFolder) {
    const { id, name } = uiState.activeContextMenuFolder;
    openRenameFolderDialog(id, name);
  }
});
