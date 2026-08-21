import { Router } from "express";
import { loginAuth, loginGet } from "../controller/login.controller.js";
import { redirectIfAuthenticated } from "../middleware/authGuards.js";

const loginRouter = Router();

loginRouter.get("/", redirectIfAuthenticated, loginGet);
loginRouter.post("/", redirectIfAuthenticated, loginAuth);

export { loginRouter };
