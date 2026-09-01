import { Router } from "express";
import { dashboardGet } from "../controller/dashboard.controller.js";
import { requireAuth } from "../middleware/authGuards.js";

const dashboardRouter = Router();

dashboardRouter.get("/", requireAuth, dashboardGet);

export { dashboardRouter };
