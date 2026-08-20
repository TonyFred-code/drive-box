function redirectIfAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) return next();

  if (req.accepts("json")) {
    return res.status(409).json({
      msg: "User is already logged in",
    });
  }

  return res.redirect("/dashboard");
}

function requireAuth(req, res, next) {
  if (!req.user) {
    if (req.accepts("json")) {
      return res.status(401).json({
        msg: "User is not authenticated",
      });
    }

    req.session.redirectTo = req.originalUrl;
    return res.redirect("/login");
  }

  next();
}

export { redirectIfAuthenticated, requireAuth };
