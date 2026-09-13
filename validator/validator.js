import { ExpressValidator } from "express-validator";

const customValidator = new ExpressValidator(
  {}, // custom validator,
  {}, // custom sanitizers,
  {
    errorFormatter: (err) => {
      return {
        field: err.path,
        msg: err.msg,
      };
    },
  }
);

export const { body, validationResult, param } = customValidator;
export default validationResult;
