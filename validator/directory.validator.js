import { body, param } from "./validator.js";

const directoryNameValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Directory name is required")
    .isLength({ min: 1, max: 32 })
    .withMessage("Directory name must be between 1 and 32 characters long")
    .matches(/^[a-zA-Z0-9_\- ]+$/)
    .withMessage(
      "Directory name can only contain letters, numbers, underscores, hyphens, and spaces"
    ),
];

const directoryIdValidationRules = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Directory ID is required")
    .isUUID()
    .withMessage("Invalid directory ID format"),
];

const directoryParentIdValidationRules = [
  body("parentId")
    .trim()
    .notEmpty()
    .withMessage("Parent directory ID is required")
    .isUUID()
    .withMessage("Invalid parent directory ID format"),
];

const directoryValidationRules = [
  ...directoryNameValidationRules,
  ...directoryParentIdValidationRules,
];

export {
  directoryNameValidationRules,
  directoryParentIdValidationRules,
  directoryValidationRules,
  directoryIdValidationRules,
};
