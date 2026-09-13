import { Router } from "express";
import {
  createDirectory,
  updateDirectory,
  deleteDirectory,
} from "../controller/directory.controller.js";
import { requireAuth } from "../middleware/authGuards.js";
import {
  directoryIdValidationRules,
  directoryNameValidationRules,
  directoryValidationRules,
} from "../validator/directory.validator.js";
import { handleValidationError } from "../validator/validationHandler.js";

const directoryRouter = Router();

directoryRouter.use(requireAuth);

directoryRouter.post(
  "/",
  directoryValidationRules,
  handleValidationError,
  createDirectory
);

directoryRouter.patch(
  "/:id",
  directoryIdValidationRules,
  directoryNameValidationRules,
  handleValidationError,
  updateDirectory
);
directoryRouter.delete(
  "/:id",
  directoryIdValidationRules,
  handleValidationError,
  deleteDirectory
);

export { directoryRouter };
