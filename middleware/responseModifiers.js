import { getFileIcon } from "../lib/dashboardUtils.js";

function attachUserLocals(req, res, next) {
  res.locals.user = req.user;
  res.locals.getFileIcon = getFileIcon;
  next();
}

export { attachUserLocals };
