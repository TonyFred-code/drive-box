import { checkEmailExists } from "../db/user.js";

async function checkEmailUnique(req, res, next) {
  try {
    const emailTaken = await checkEmailExists(req.query.email);

    return res.json({ emailTaken });
  } catch (error) {
    //TODO: Uniquely identify error?

    next(error);
  }
}

export { checkEmailUnique };
