import { Router } from "express";
import { logoutUser } from "../controller/logout.controller.js";

const logoutRouter = Router();

logoutRouter.post("/", logoutUser);

export { logoutRouter };
