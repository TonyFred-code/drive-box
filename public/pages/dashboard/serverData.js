const raw = JSON.parse(
  document.getElementById("dashboard-data")?.textContent ?? "{}"
);

const currentDirectory = raw.currentDirectory ?? null;
const files = raw.files ?? [];
const children = raw.children ?? [];
const breadcrumbs = raw.breadcrumbs ?? [];
const user = raw.user ?? null;
const isRoot = raw.isRoot ?? true;

export { isRoot, user, breadcrumbs, children, files, currentDirectory };
