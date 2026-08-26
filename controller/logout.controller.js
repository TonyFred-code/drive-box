function logoutUser(req, res, next) {
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        return next(destroyErr);
      }

      res.clearCookie("connect.sid");

      if (req.accepts("html")) {
        return res.redirect("/");
      }

      return res.json({
        msg: "User is logged out",
      });
    });
  });
}

export { logoutUser };
