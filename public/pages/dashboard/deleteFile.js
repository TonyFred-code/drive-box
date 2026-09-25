import { uiState } from "./uiState.js";

const deleteFileDialog = document.getElementById("dialog-delete-file");
const deleteFileSummary = document.getElementById("delete-file-summary");
const deleteFileBtn = document.getElementById("delete-file-btn");

function openDeleteFileDialog() {}

async function handleFileDeletion(fileId) {
  try {
    deleteFileBtn.disabled = true;
    deleteFileBtn.textContent = "Deleting...";

    const response = await fetch(`/files/${fileId}`, {
      method: "DELETE",
    });
    const data = await response.json();

    if (!response.ok) {
      // TODO: Add notification system
      const err = new Error(data.error || "Failed to delete file");
      console.error(err);
      return;
    }

    deleteFileDialog.close();
    window.location.reload();
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}

deleteFileBtn?.addEventListener("click", () => {
  if (!uiState.activeContextMenuFile) return;

  const fileId = uiState.activeContextMenuFile.id;
  handleFileDeletion(fileId);
});
