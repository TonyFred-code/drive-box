import { formatDate } from "../../lib/dashboardUtils.js";
import { dialogOpen } from "./dialog.js";

const openPageMenuBtn = document.getElementById("open-page-menu-btn");
const pageMenuDialog = document.getElementById("dialog-page-menu");

openPageMenuBtn?.addEventListener("click", () => {
  dialogOpen(pageMenuDialog);
});
