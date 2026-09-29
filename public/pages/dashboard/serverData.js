const raw = JSON.parse(
  document.getElementById("dashboard-data")?.textContent ?? "{}"
);

const currentDirectory = raw.currentDirectory ?? null;
const files = raw.files ?? [];
const children = raw.children ?? [];
const breadcrumbs = raw.breadcrumbs ?? [];
const user = raw.user ?? null;
const isRoot = raw.isRoot ?? true;
const directoryStats = raw.directoryStats ?? {
  fileCount: 0,
  folderCount: 0,
  totalSize: 0,
};

export {
  isRoot,
  user,
  breadcrumbs,
  children,
  files,
  currentDirectory,
  directoryStats,
};
