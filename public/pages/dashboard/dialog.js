import { uiState } from "./uiState.js";

function dialogOpen(dialog) {
  if (!dialog._cancelHandlerAttached) {
    dialog.addEventListener("cancel", (e) => e.preventDefault());
    dialog._cancelHandlerAttached = true;
  }

  uiState.dialogOpenOrder.push(dialog);
  dialog.showModal();
  console.log(uiState.dialogOpenOrder);
}

function dialogClose(dialog) {
  uiState.dialogOpenOrder = uiState.dialogOpenOrder.filter((d) => d !== dialog);
  dialog.close();
  console.log(uiState.dialogOpenOrder);
}

function getTopMostDialog() {
  if (uiState.dialogOpenOrder.length < 1) return;

  return uiState.dialogOpenOrder[uiState.dialogOpenOrder.length - 1];
}

function closeTopMostDialog() {
  const topMostDialog = getTopMostDialog();

  if (!topMostDialog) return;

  console.log(topMostDialog);

  dialogClose(topMostDialog);
}

export { dialogOpen, dialogClose, getTopMostDialog, closeTopMostDialog };
