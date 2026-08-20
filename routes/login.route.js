import { Router } from "express";
import { loginAuth, loginGet } from "../controller/login.controller.js";

const loginRouter = Router();

loginRouter.get("/", loginGet);
loginRouter.post("/", loginAuth);

export { loginRouter };
