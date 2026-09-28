import { formatDate } from "../../lib/dashboardUtils.js";

const openPageMenuBtn = document.getElementById("open-page-menu-btn");
const pageMenuDialog = document.getElementById("dialog-page-menu");

openPageMenuBtn?.addEventListener("click", () => {
  pageMenuDialog.showModal();
});
