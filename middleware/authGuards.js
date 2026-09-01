function redirectIfAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) return next();

  if (req.accepts("html")) {
    return res.redirect("/dashboard");
  }

  return res.status(409).json({
    msg: "User is already logged in",
  });
}

function requireAuth(req, res, next) {
  if (!req.user) {
    if (req.accepts("html")) {
      req.session.redirectTo = req.originalUrl;
      return res.redirect("/login");
    }

    return res.status(401).json({
      msg: "User is not authenticated",
    });
  }

  next();
}

export { redirectIfAuthenticated, requireAuth };
