import { Router } from "express";
import {
  checkUserIdentifierUnique,
  registerPost,
} from "../controller/register.controller.js";
import { redirectIfAuthenticated } from "../middleware/authGuards.js";

const registerRouter = Router();

registerRouter.get("/user-identifier-unique", checkUserIdentifierUnique);
registerRouter.post("/", redirectIfAuthenticated, registerPost);

export { registerRouter };
