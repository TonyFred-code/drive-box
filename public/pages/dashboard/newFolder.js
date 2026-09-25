import { validateFolderName } from "../../lib/dashboardUtils.js";
import { currentDirectory } from "./serverData.js";

const emptyNewFolderBtn = document.getElementById("empty-new-folder-btn");
const menuCreateFolderBtn = document.getElementById("menu-create-folder-btn");

const newFolderDialog = document.getElementById("dialog-new-folder");
const newFolderForm = document.getElementById("new-folder-form");
const newFolderNameInput = document.getElementById("new-folder-name-input");
const newFolderError = document.getElementById("new-folder-error");
const newFolderCharCount = document.getElementById("new-folder-char-count");
const newFolderSubmitBtn = document.getElementById("new-folder-submit-btn");

function openNewFolderDialog() {
  newFolderError.classList.add("hidden");
  newFolderNameInput.value = "Untitled folder";
  newFolderCharCount.textContent = `${newFolderNameInput.value.length}/32`;
  newFolderSubmitBtn.disabled = false;
  newFolderDialog.showModal();
  newFolderNameInput.focus();
  newFolderNameInput.select();
}

newFolderNameInput?.addEventListener("input", () => {
  const value = newFolderNameInput.value;
  newFolderCharCount.textContent = `${value.length}/32`;

  const { valid, message } = validateFolderName(value);
  if (!valid) {
    newFolderError.textContent = message;
    newFolderError.classList.remove("hidden");
    newFolderSubmitBtn.disabled = true;
  } else {
    newFolderError.classList.add("hidden");
    newFolderSubmitBtn.disabled = false;
  }
});

newFolderForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = newFolderNameInput.value.trim();
  const { valid, message } = validateFolderName(name);

  if (!valid) {
    newFolderError.textContent = message;
    newFolderError.classList.remove("hidden");
    return;
  }

  newFolderSubmitBtn.disabled = true;
  newFolderSubmitBtn.textContent = "Creating...";

  try {
    const res = await fetch("/directories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        parentId: currentDirectory.id,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      const errMsg =
        result.error?.[0]?.msg || result.message || "Failed to create folder";
      newFolderError.textContent = errMsg;
      newFolderError.classList.remove("hidden");
      newFolderSubmitBtn.disabled = false;
      newFolderSubmitBtn.textContent = "create";
      return;
    }

    // Success: reload current directory view to see new folder
    window.location.reload();
  } catch (err) {
    newFolderError.textContent = "Network error. Please try again.";
    newFolderError.classList.remove("hidden");
    newFolderSubmitBtn.disabled = false;
    newFolderSubmitBtn.textContent = "create";
  }
});

emptyNewFolderBtn?.addEventListener("click", openNewFolderDialog);
menuCreateFolderBtn?.addEventListener("click", openNewFolderDialog);

export { openNewFolderDialog };
