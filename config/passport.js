import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { getUserByEmail, getUserById, getUserByUsername } from "../db/user.js";
import { validPassword } from "../lib/passwordUtils.js";

passport.use(
  new LocalStrategy(
    { usernameField: "userIdentifier" },
    async (userIdentifier, password, done) => {
      try {
        let identifierType = "";
        let user = null;
        if (userIdentifier.includes("@")) {
          identifierType = "email";
          user = await getUserByEmail(userIdentifier);
        } else {
          identifierType = "username";
          user = await getUserByUsername(userIdentifier);
        }

        const errMsg = `Invalid ${identifierType} or password`;

        if (!user) {
          return done(null, false, { message: errMsg });
        }

        const isValid = await validPassword(password, user.password);

        if (!isValid) {
          return done(null, false, { message: errMsg });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserById(id);

    done(null, user);
  } catch (error) {
    done(error);
  }
});
