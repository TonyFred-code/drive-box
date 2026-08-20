import { Router } from "express";
import { dashboardGet } from "../controller/dashboard.controller.js";

const dashboardRouter = Router();

dashboardRouter.get("/", dashboardGet);

export { dashboardRouter };
