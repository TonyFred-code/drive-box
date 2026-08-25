import { Router } from "express";
import {
  checkUserIdentifierUnique,
  registerPageGet,
  registerPost,
} from "../controller/register.controller.js";
import { redirectIfAuthenticated } from "../middleware/authGuards.js";

const registerRouter = Router();

registerRouter.get("/user-identifier-unique", checkUserIdentifierUnique);
registerRouter.get("/", redirectIfAuthenticated, registerPageGet);
registerRouter.post("/", redirectIfAuthenticated, registerPost);

export { registerRouter };
