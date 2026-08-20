import { checkEmailExists, createNewUser } from "../db/user.js";
import { hashPassword } from "../lib/passwordUtils.js";

async function checkEmailUnique(req, res, next) {
  try {
    const emailTaken = await checkEmailExists(req.query.email);

    return res.json({ emailTaken });
  } catch (error) {
    //TODO: Uniquely identify error?

    next(error);
  }
}

async function registerPost(req, res, next) {
  const { email, password, username } = req.body;
  const hashedPassword = await hashPassword(password);

  try {
    const user = await createNewUser(email, username, hashedPassword);

    return req.login(user, (err) => {
      if (err) return next(err);

      res.redirect("/dashboard");
    });
  } catch (error) {
    next(error);
  }
}

export { checkEmailUnique, registerPost };
