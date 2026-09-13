import passport from "passport";
import { prisma } from "../db/prisma.js";

function loginGet(req, res) {
  res.render("login");
}

function loginAuth(req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      if (req.accepts("html")) {
        return res.redirect("/login");
      }

      const msg = info.message || "Email or password is incorrect";
      return res.status(401).json({
        errors: [
          {
            path: "form",
            msg,
          },
        ],
      });
    }

    // Keeping session info allows intended destination redirect
    req.logIn(user, { keepSessionInfo: true }, async (error) => {
      if (error) {
        return next(error);
      }

      if (!user.rootDirectoryId) {
        await prisma.$transaction(async (tx) => {
          const rootDirectory = await tx.directory.create({
            data: {
              name: "home",
              userId: user.id,
              parentId: null,
            },
            select: {
              id: true,
            },
          });

          const updatedUser = await tx.user.update({
            where: {
              id: user.id,
            },
            data: {
              rootDirectoryId: rootDirectory.id,
            },
            select: {
              id: true,
              rootDirectoryId: true,
              username: true,
            },
          });

          user.rootDirectoryId = rootDirectory.id;
          console.warn(
            "[SELF-HEAL]: Created root directory for user:",
            JSON.stringify({ updatedUser })
          );
        });
      }

      const targetUrl = req.session.redirectTo || "/dashboard";

      delete req.session.redirectTo;

      if (req.accepts("html")) {
        return res.redirect(targetUrl);
      }

      return res.status(200).json({
        success: true,
        redirectUrl: targetUrl,
      });
    });
  })(req, res, next);
}

export { loginAuth, loginGet };
