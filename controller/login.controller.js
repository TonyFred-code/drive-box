import passport from "passport";

function loginGet(req, res) {
  res.render("login");
}

function loginAuth(req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({
        errors: [
          {
            path: "form",
            msg: info.message || "Email or password is incorrect",
          },
        ],
      });
    }

    // Keeping session info allows intended destination redirect
    req.logIn(user, { keepSessionInfo: true }, (error) => {
      if (error) {
        return next(error);
      }

      const targetUrl = req.session.redirectTo || "/dashboard";

      delete req.session.redirectTo;

      if (req.accepts("json")) {
        return res.status(200).json({
          success: true,
          redirectUrl: targetUrl,
        });
      }

      return res.redirect(targetUrl);
    });
  })(req, res, next);
}

export { loginAuth, loginGet };
