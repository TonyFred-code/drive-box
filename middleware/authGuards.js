function redirectIfAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) return next();

  if (req.accepts("json")) {
    return res.status(409).json({
      msg: "User is already logged in",
    });
  }

  return res.redirect("/dashboard");
}

export { redirectIfAuthenticated };
