import { checkEmailExists, createNewUser } from "../db/user.js";
import { Prisma } from "../generated/prisma/index.js";
import { hashPassword } from "../lib/passwordUtils.js";
import { handleUniqueConstraintError } from "../lib/prismaUtils.js";
import { REGISTER_ERROR_CODES } from "../public/constants/errorCodes.js";

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
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const violatingFields = handleUniqueConstraintError(error);

        if (violatingFields.length === 0) {
          console.error(JSON.stringify(error.meta, null, 2));
          return res.status(500).json({
            error: {
              msg: "Unknown unique constraint violated",
              code: REGISTER_ERROR_CODES.UNIQUE_CONSTRAINT_VIOLATION,
            },
          });
        }

        return res.status(409).json({
          error: {
            msg: "One or more fields cause a unique constraint violation",
            fields: violatingFields,
            code: REGISTER_ERROR_CODES.UNIQUE_CONSTRAINT_VIOLATION,
          },
        });
      }
    }

    return next(error);
  }
}

export { checkEmailUnique, registerPost };
