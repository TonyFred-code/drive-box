import { Router } from "express";
import {
  checkEmailUnique,
  registerPost,
} from "../controller/register.controller.js";
import { redirectIfAuthenticated } from "../middleware/authGuards.js";

const registerRouter = Router();

registerRouter.get("/email-unique", checkEmailUnique);
registerRouter.post("/", redirectIfAuthenticated, registerPost);

export { registerRouter };
