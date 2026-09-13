import {
  getDirectoryWithChildren,
  getDirectoryBreadcrumbs,
} from "../db/directory.js";

async function dashboardGet(req, res) {
  const user = req.user;
  const activeDirectoryId = req.query.directoryId || user.rootDirectoryId;
  const sortBy = req.query.sortBy || "name";
  const order = req.query.order || "asc";

  try {
    const currentDirectory = await getDirectoryWithChildren(
      activeDirectoryId,
      user.id
    );
    const breadcrumbs = await getDirectoryBreadcrumbs(
      activeDirectoryId,
      user.id
    );

    let children = [...(currentDirectory.children || [])];

    children.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name, undefined, {
          sensitivity: "base",
        });
      } else if (sortBy === "updatedAt") {
        comparison = new Date(a.updatedAt) - new Date(b.updatedAt);
      } else if (sortBy === "createdAt") {
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
      }
      return order === "desc" ? -comparison : comparison;
    });

    const isRoot = currentDirectory.id === user.rootDirectoryId;

    if (req.accepts("html")) {
      return res.render("dashboard", {
        currentDirectory,
        children,
        breadcrumbs,
        isRoot,
        sortBy,
        order,
        currentDirectory,
        directoryChildren: children,
      });
    }

    return res.json({
      success: true,
      data: {
        ...currentDirectory,
        children,
        breadcrumbs,
        isRoot,
      },
    });
  } catch (error) {
    console.error(error);

    if (req.accepts("html")) {
      return res.redirect("/dashboard");
    }

    return res.status(404).json({
      success: false,
      error: "Directory not found",
    });
  }
}

export { dashboardGet };
