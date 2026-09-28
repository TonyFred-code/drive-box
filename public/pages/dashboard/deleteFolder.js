import { closeFolderContextMenu } from "./folderContextMenu.js";
import { breadcrumbs, currentDirectory } from "./serverData.js";
import { uiState } from "./uiState.js";

const deleteFolderDialog = document.getElementById("dialog-delete-folder");
const deleteFolderIdInput = document.getElementById("delete-folder-id");
const deleteFolderMsg = document.getElementById("delete-folder-msg");
const confirmDeleteFolderBtn = document.getElementById(
  "confirm-delete-folder-btn"
);

const ctxDeleteBtn = document.getElementById("ctx-delete");

const menuDeleteCurrentBtn = document.getElementById("menu-delete-current-btn");

function openDeleteFolderDialog(folderId, folderName, isCurrent = false) {
  deleteFolderIdInput.value = folderId;
  deleteFolderIdInput.dataset.isCurrent = isCurrent ? "true" : "false";
  deleteFolderMsg.textContent = `Are you sure you want to delete "${folderName}" and all of its contents?`;
  deleteFolderDialog.showModal();
}

menuDeleteCurrentBtn?.addEventListener("click", () => {
  openDeleteFolderDialog(currentDirectory.id, currentDirectory.name, true);
});

confirmDeleteFolderBtn?.addEventListener("click", async () => {
  const folderId = deleteFolderIdInput.value;
  const isCurrent = deleteFolderIdInput.dataset.isCurrent === "true";

  confirmDeleteFolderBtn.disabled = true;
  confirmDeleteFolderBtn.textContent = "Deleting...";

  try {
    const res = await fetch(`/directories/${encodeURIComponent(folderId)}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const result = await res.json();
      alert(result.error?.[0]?.msg || "Failed to delete directory");
      confirmDeleteFolderBtn.disabled = false;
      confirmDeleteFolderBtn.textContent = "Delete";
      return;
    }

    // If deleted current directory, navigate back to parent or root
    if (isCurrent) {
      const parentCrumb =
        breadcrumbs && breadcrumbs.length >= 3
          ? breadcrumbs[breadcrumbs.length - 2]
          : null;
      if (parentCrumb) {
        window.location.href = `/dashboard?directoryId=${encodeURIComponent(parentCrumb.id)}`;
      } else {
        window.location.href = "/dashboard";
      }
    } else {
      window.location.reload();
    }
  } catch (err) {
    alert("Network error while deleting. Please try again.");
    confirmDeleteFolderBtn.disabled = false;
    confirmDeleteFolderBtn.textContent = "Delete";
  }
});

ctxDeleteBtn?.addEventListener("click", () => {
  if (uiState.activeContextMenuFolder) {
    const { id, name } = uiState.activeContextMenuFolder;

    closeFolderContextMenu();
    openDeleteFolderDialog(id, name, false);
  }
});
