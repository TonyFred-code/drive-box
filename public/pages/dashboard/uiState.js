import { SelectedFilesManager } from "../../lib/selectedFilesManager.js";

const uiState = {
  selectedFilesManager: new SelectedFilesManager(),
  activeContextMenuFile: null,
  activeContextMenuFolder: null,
  dialogOpenOrder: [],
};

export { uiState };
