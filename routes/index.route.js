import { Router } from "express";
import { getIndexPage } from "../controller/index.controller.js";

const indexRouter = Router();

indexRouter.get("/", getIndexPage);

export { indexRouter };
