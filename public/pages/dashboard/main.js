const dataElement = document.getElementById("dashboard-data");
let dashboardData = {
  currentDirectory: null,
  children: [],
  breadcrumbs: [],
  isRoot: true,
  sortBy: "name",
  order: "asc",
  user: null,
};

if (dataElement) {
  try {
    dashboardData = JSON.parse(dataElement.textContent || "{}");
  } catch (e) {
    console.error("Failed to parse dashboard data:", e);
  }
}

const { currentDirectory, children, breadcrumbs, isRoot, user } = dashboardData;

// DOM Elements
const profileMenuBtn = document.getElementById("profile-menu-btn");
const profileDropdown = document.getElementById("profile-dropdown");
const viewStorageBtn = document.getElementById("view-storage-btn");

const openSortBtn = document.getElementById("open-sort-btn");
const openPageMenuBtn = document.getElementById("open-page-menu-btn");

const emptyNewFolderBtn = document.getElementById("empty-new-folder-btn");
const emptyUploadBtn = document.getElementById("empty-upload-btn");
const fileUploadInput = document.getElementById("file-upload-input");

// Dialogs
const newFolderDialog = document.getElementById("dialog-new-folder");
const newFolderForm = document.getElementById("new-folder-form");
const newFolderNameInput = document.getElementById("new-folder-name-input");
const newFolderError = document.getElementById("new-folder-error");
const newFolderCharCount = document.getElementById("new-folder-char-count");
const newFolderSubmitBtn = document.getElementById("new-folder-submit-btn");

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

const deleteFolderDialog = document.getElementById("dialog-delete-folder");
const deleteFolderIdInput = document.getElementById("delete-folder-id");
const deleteFolderMsg = document.getElementById("delete-folder-msg");
const confirmDeleteFolderBtn = document.getElementById(
  "confirm-delete-folder-btn"
);

const detailsDialog = document.getElementById("dialog-details");
const detailsContent = document.getElementById("details-content");

const sortDialog = document.getElementById("dialog-sort");
const sortForm = document.getElementById("sort-form");
const labelSortAsc = document.getElementById("label-sort-asc");
const labelSortDesc = document.getElementById("label-sort-desc");

const pageMenuDialog = document.getElementById("dialog-page-menu");
const menuCreateFolderBtn = document.getElementById("menu-create-folder-btn");
const menuUploadBtn = document.getElementById("menu-upload-btn");
const menuRenameCurrentBtn = document.getElementById("menu-rename-current-btn");
const menuDeleteCurrentBtn = document.getElementById("menu-delete-current-btn");
const menuCurrentDetailsBtn = document.getElementById(
  "menu-current-details-btn"
);

const folderContextMenu = document.getElementById("folder-context-menu");
const ctxOpenBtn = document.getElementById("ctx-open");
const ctxRenameBtn = document.getElementById("ctx-rename");
const ctxDetailsBtn = document.getElementById("ctx-details");
const ctxDeleteBtn = document.getElementById("ctx-delete");

let activeContextMenuFolder = null;

const INVALID_NAME_REGEX = /[/\\:*?"<>|]/;

function validateFolderName(name) {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, message: "Folder name cannot be empty" };
  }
  if (INVALID_NAME_REGEX.test(trimmed)) {
    return {
      valid: false,
      message: 'Folder name cannot contain / \\ : * ? " < > |',
    };
  }
  if (trimmed.length > 32) {
    return {
      valid: false,
      message: "Folder name must be 32 characters or less",
    };
  }
  return { valid: true, message: "" };
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function closeAllDialogs() {
  document.querySelectorAll("dialog[open]").forEach((d) => d.close());
  folderContextMenu?.classList.add("hidden");
  profileDropdown?.classList.add("hidden");
}

// Attach generic close buttons for dialogs
document.querySelectorAll(".dialog-cancel-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const dialog = e.target.closest("dialog");
    if (dialog) dialog.close();
  });
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });
});

if (profileMenuBtn && profileDropdown) {
  profileMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (
      !profileDropdown.contains(e.target) &&
      !profileMenuBtn.contains(e.target)
    ) {
      profileDropdown.classList.add("hidden");
    }
  });
}

// Storage details button in profile
viewStorageBtn?.addEventListener("click", () => {
  profileDropdown.classList.add("hidden");
  showRootDetails();
});

document.querySelectorAll(".folder-card").forEach((card) => {
  // Navigation triggers on card click (except 3-dots button)
  card.addEventListener("click", (e) => {
    if (e.target.closest(".item-menu-btn")) return;
    const folderId = card.dataset.id;
    if (folderId) {
      window.location.href = `/dashboard?directoryId=${encodeURIComponent(folderId)}`;
    }
  });
});

function openNewFolderDialog() {
  closeAllDialogs();
  newFolderError.classList.add("hidden");
  newFolderNameInput.value = "Untitled folder";
  newFolderCharCount.textContent = `${newFolderNameInput.value.length}/32`;
  newFolderSubmitBtn.disabled = false;
  newFolderDialog.showModal();
  newFolderNameInput.focus();
  newFolderNameInput.select();
}

emptyNewFolderBtn?.addEventListener("click", openNewFolderDialog);
menuCreateFolderBtn?.addEventListener("click", openNewFolderDialog);

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

// ============================================================================
// RENAME FOLDER DIALOG & UPDATING
// ============================================================================

function openRenameFolderDialog(folderId, currentName) {
  closeAllDialogs();
  renameFolderIdInput.value = folderId;
  renameFolderNameInput.value = currentName;
  renameFolderCharCount.textContent = `${currentName.length}/32`;
  renameFolderError.classList.add("hidden");
  renameFolderDialog.showModal();
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
            breadcrumbs && breadcrumbs.length >= 2
              ? breadcrumbs[breadcrumbs.length - 2]
              : null;
          errMsg = parentCrumb
            ? `A directory with this name already exists in the parent directory ("${parentCrumb.name}")`
            : "A directory with this name already exists in the parent directory";
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

function openDeleteFolderDialog(folderId, folderName, isCurrent = false) {
  closeAllDialogs();
  deleteFolderIdInput.value = folderId;
  deleteFolderIdInput.dataset.isCurrent = isCurrent ? "true" : "false";
  deleteFolderMsg.textContent = `Are you sure you want to delete "${folderName}" and all of its contents?`;
  deleteFolderDialog.showModal();
}

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
          ? breadcrumbs[breadcrumbs.length - 3]
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

function showRootDetails() {
  closeAllDialogs();
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

function showFolderDetails(folder) {
  closeAllDialogs();
  const parentName =
    breadcrumbs && breadcrumbs.length > 0
      ? `/${breadcrumbs.map((b) => b.name).join("/")}/`
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

openSortBtn?.addEventListener("click", () => {
  closeAllDialogs();
  sortDialog.showModal();
});

// Dynamic sorting direction labels based on field
sortForm?.querySelectorAll("input[name='sortBy']").forEach((radio) => {
  radio.addEventListener("change", (e) => {
    const val = e.target.value;
    if (val === "name") {
      labelSortAsc.textContent = "Ascending (A to Z)";
      labelSortDesc.textContent = "Descending (Z to A)";
    } else {
      labelSortAsc.textContent = "Ascending (Old to New)";
      labelSortDesc.textContent = "Descending (New to Old)";
    }
  });
});

sortForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(sortForm);
  const sortBy = formData.get("sortBy") || "name";
  const order = formData.get("order") || "asc";

  const url = new URL(window.location.href);
  url.searchParams.set("sortBy", sortBy);
  url.searchParams.set("order", order);
  window.location.href = url.toString();
});

openPageMenuBtn?.addEventListener("click", () => {
  closeAllDialogs();
  pageMenuDialog.showModal();
});

menuRenameCurrentBtn?.addEventListener("click", () => {
  pageMenuDialog.close();
  openRenameFolderDialog(currentDirectory.id, currentDirectory.name);
});

menuDeleteCurrentBtn?.addEventListener("click", () => {
  pageMenuDialog.close();
  openDeleteFolderDialog(currentDirectory.id, currentDirectory.name, true);
});

menuCurrentDetailsBtn?.addEventListener("click", () => {
  pageMenuDialog.close();
  if (isRoot) {
    showRootDetails();
  } else {
    showFolderDetails(currentDirectory);
  }
});

document.querySelectorAll(".item-menu-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const card = btn.closest(".folder-card");
    if (!card) return;

    activeContextMenuFolder = {
      id: card.dataset.id,
      name: card.dataset.name,
      createdAt: card.dataset.createdAt,
      updatedAt: card.dataset.updatedAt,
    };

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
    folderContextMenu.classList.remove("hidden");
  });
});

// Close context menu on outside click
document.addEventListener("click", (e) => {
  if (!folderContextMenu?.contains(e.target)) {
    folderContextMenu?.classList.add("hidden");
  }
});

// Context Menu Action Listeners
ctxOpenBtn?.addEventListener("click", () => {
  if (activeContextMenuFolder) {
    window.location.href = `/dashboard?directoryId=${encodeURIComponent(activeContextMenuFolder.id)}`;
  }
});

ctxRenameBtn?.addEventListener("click", () => {
  if (activeContextMenuFolder) {
    const { id, name } = activeContextMenuFolder;
    folderContextMenu.classList.add("hidden");
    openRenameFolderDialog(id, name);
  }
});

ctxDetailsBtn?.addEventListener("click", () => {
  if (activeContextMenuFolder) {
    folderContextMenu.classList.add("hidden");
    showFolderDetails(activeContextMenuFolder);
  }
});

ctxDeleteBtn?.addEventListener("click", () => {
  if (activeContextMenuFolder) {
    const { id, name } = activeContextMenuFolder;
    folderContextMenu.classList.add("hidden");
    openDeleteFolderDialog(id, name, false);
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAllDialogs();
});

function triggerFileUpload() {
  closeAllDialogs();
  fileUploadInput.click();
}

emptyUploadBtn?.addEventListener("click", triggerFileUpload);
menuUploadBtn?.addEventListener("click", triggerFileUpload);

fileUploadInput?.addEventListener("change", () => {
  if (fileUploadInput.files && fileUploadInput.files.length > 0) {
    alert(
      `Selected ${fileUploadInput.files.length} file(s). Upload implementation is up next!`
    );
    fileUploadInput.value = "";
  }
});
