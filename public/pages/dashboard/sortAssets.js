import { dialogOpen } from "./dialog.js";

const openSortBtn = document.getElementById("open-sort-btn");
const sortDialog = document.getElementById("dialog-sort");
const sortForm = document.getElementById("sort-form");
const labelSortAsc = document.getElementById("label-sort-asc");
const labelSortDesc = document.getElementById("label-sort-desc");

openSortBtn?.addEventListener("click", () => {
  dialogOpen(sortDialog);
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
