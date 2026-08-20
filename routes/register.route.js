import { Router } from "express";
import { checkEmailUnique } from "../controller/register.controller.js";

const registerRouter = Router();

registerRouter.get("/email-unique", checkEmailUnique);

export { registerRouter };
