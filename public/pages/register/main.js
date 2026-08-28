import { REGISTER_ERROR_CODES } from "../../constants/errorCodes.js";
import { isValidEmail } from "../../lib/emailUtils.js";

const registerForm = document.querySelector("form");
const usernameFieldElm = registerForm.querySelector("input#username");
const emailFieldElm = registerForm.querySelector("input#email");
const passwordFieldElm = registerForm.querySelector("input#password");
const confirmPasswordFieldElm = registerForm.querySelector(
  "input#confirmPassword"
);
const nextStepBtn = registerForm.querySelector("button#next-form-step-btn");
const previousStepBtn = registerForm.querySelector(
  "button#previous-form-step-btn"
);
const passwordReqListContainer = registerForm.querySelector(
  "#password-requirements-container"
);
const togglePasswordVisibilityElm = registerForm.querySelector("input#toggle");

const formFields = {
  EMAIL: "email",
  USERNAME: "username",
  PASSWORD: "password",
  CONFIRM_PASSWORD: "confirmPassword",
};

const formSteps = {
  STEP_ONE: "one",
  STEP_TWO: "two",
};

const formFieldToFormStep = {
  [formFields.EMAIL]: formSteps.STEP_ONE,
  [formFields.USERNAME]: formSteps.STEP_ONE,
  [formFields.CONFIRM_PASSWORD]: formSteps.STEP_TWO,
  [formFields.PASSWORD]: formSteps.STEP_TWO,
};

function clearFieldValidityStatus(fieldName) {
  const fieldMsgElm = registerForm.querySelector(
    `[data-field-msg='${fieldName}']`
  );
  const fieldElm = registerForm.querySelector(
    `[data-field-name='${fieldName}']`
  );

  if (!fieldMsgElm || !fieldElm) return;

  fieldElm.dataset.validity = "default";
  registerForm.dataset.validity = "default";
  fieldMsgElm.classList.add("hidden");
}

function reportFieldValidity(fieldName) {}

function reportFieldInvalidity(fieldName, msg) {
  const fieldMsgElm = registerForm.querySelector(
    `[data-field-msg='${fieldName}']`
  );
  const fieldElm = registerForm.querySelector(
    `[data-field-name='${fieldName}']`
  );

  if (!fieldMsgElm || !fieldElm) return;

  fieldMsgElm.textContent = msg;
  fieldMsgElm.classList.remove("hidden");
  fieldElm.dataset.validity = "invalid";
}

function emailFieldValid() {
  let valid = true;
  let msg = "";
  const emailValue = emailFieldElm.value.trim();

  if (!emailValue) {
    valid = false;
    msg = "Please enter a valid email address";
  }

  if (!isValidEmail(emailValue)) {
    msg = "Email address is invalid";
    valid = false;
  }

  return {
    valid,
    msg,
  };
}

function usernameFieldValid() {
  let valid = true;
  let msg = "";
  const usernameValue = usernameFieldElm.value.trim();

  if (!usernameValue) {
    valid = false;
    msg = "Please enter a valid username";
  } else if (usernameValue.length < 3 || usernameValue.length > 32) {
    valid = false;
    msg = "Username must be between 3 and 32 characters long";
  } else if (!/^[\w]{3,32}$/.test(usernameValue)) {
    valid = false;
    msg = "Username must contain only alphanumeric characters and underscore";
  }

  return {
    valid,
    msg,
  };
}

function meetsPasswordStrengthRequirements() {
  const password = passwordFieldElm.value;
  // Min 12 characters long
  // must contain at least one upper case
  // must contain at least one lowercase characters
  // must contain at least one digit
  // must contain at least on symbol
  return (
    password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

function togglePasswordRequirementsVisibility() {
  const isStrongPassword = meetsPasswordStrengthRequirements();
  passwordReqListContainer.classList.toggle("hidden", isStrongPassword);
}

function updatePasswordRequirementsList() {
  const password = passwordFieldElm.value;

  togglePasswordRequirement("length", password.length >= 12);
  togglePasswordRequirement("upper", /[A-Z]/.test(password));
  togglePasswordRequirement("lower", /[a-z]/.test(password));
  togglePasswordRequirement("number", /[0-9]/.test(password));
  togglePasswordRequirement("special", /[^A-Za-z0-9]/.test(password));
}

function togglePasswordRequirement(requirementName, met) {
  const requirementContainerElm = passwordReqListContainer.querySelector(
    `[data-password-requirement='${requirementName}']`
  );

  if (!requirementContainerElm) return;

  requirementContainerElm.dataset.requirementMet = met;
}

function passwordsMatch() {
  return (
    (confirmPasswordFieldElm.value.length !== 0 ||
      passwordFieldElm.value.length !== 0) &&
    passwordFieldElm.value === confirmPasswordFieldElm.value
  );
}

function passwordFieldValid() {
  const password = passwordFieldElm.value;
  let valid = true;
  let msg = "";

  if (!password) {
    msg = "Please enter a strong password";
    valid = false;
  } else if (!meetsPasswordStrengthRequirements()) {
    msg = "Password does not meet strength requirements";
    valid = false;
  }

  return {
    valid,
    msg,
  };
}

function confirmPasswordFieldValid() {
  const value = confirmPasswordFieldElm.value;
  let msg = "";
  let valid = true;

  if (value.length === 0) {
    msg = "This field is required";
    valid = false;
  } else if (!passwordsMatch()) {
    msg = "Passwords do not match";
    valid = false;
  }

  return {
    valid,
    msg,
  };
}

function togglePasswordVisibility() {
  const visible = togglePasswordVisibilityElm.checked;

  if (visible) {
    passwordFieldElm.type = "text";
    confirmPasswordFieldElm.type = "text";
  } else {
    passwordFieldElm.type = "password";
    confirmPasswordFieldElm.type = "password";
  }
}

function changeActiveFormStep(stepName) {
  registerForm.dataset.activeStep = stepName;
}

function handleVerifyFormStepOne() {
  const usernameValidity = usernameFieldValid();
  const emailValidity = emailFieldValid();

  if (!usernameValidity.valid) {
    reportFieldInvalidity(formFields.USERNAME, usernameValidity.msg);
  } else {
    reportFieldValidity(formFields.USERNAME);
  }

  if (!emailValidity.valid) {
    reportFieldInvalidity(formFields.EMAIL, emailValidity.msg);
  } else {
    reportFieldValidity(formFields.EMAIL);
  }

  if (!usernameValidity.valid || !emailValidity.valid) return;

  changeActiveFormStep(formSteps.STEP_TWO);
}

function reportFormInvalidity(errorMsg) {
  const formErrMsgElm = registerForm.querySelector("[data-field-msg='form']");

  if (!formErrMsgElm) return;

  formErrMsgElm.textContent = errorMsg;
  registerForm.dataset.validity = "invalid";
}

function handleServerErrors(serverError) {
  const errorCode = serverError.code;

  if (errorCode === REGISTER_ERROR_CODES.UNIQUE_CONSTRAINT_VIOLATION) {
    const violatingFields = serverError.fields;

    violatingFields.forEach((fieldName) => {
      switch (fieldName) {
        case formFields.USERNAME:
          reportFieldInvalidity(fieldName, "Username is already taken");
          break;
        case formFields.EMAIL:
          reportFieldInvalidity(fieldName, "Email is already registered");
          break;

        default:
          break;
      }
    });
    changeActiveFormStep(formSteps.STEP_ONE);
    return;
  } else {
    reportFormInvalidity("An unknown error occurred. Please try again.");
  }
}

async function handleFormSubmission(event) {
  event.preventDefault();

  const usernameValidity = usernameFieldValid();
  const emailValidity = emailFieldValid();

  if (!usernameValidity.valid) {
    reportFieldInvalidity(formFields.USERNAME, usernameValidity.msg);
  } else {
    reportFieldValidity(formFields.USERNAME);
  }

  if (!emailValidity.valid) {
    reportFieldInvalidity(formFields.EMAIL, emailValidity.msg);
  } else {
    reportFieldValidity(formFields.EMAIL);
  }

  if (!usernameValidity.valid || !emailValidity.valid) {
    changeActiveFormStep(formSteps.STEP_ONE);
    return;
  }

  const passwordFieldValidity = passwordFieldValid();
  const confirmPasswordFieldValidity = confirmPasswordFieldValid();

  if (!passwordFieldValidity.valid) {
    reportFieldInvalidity(formFields.PASSWORD, passwordFieldValidity.msg);
  } else {
    reportFieldValidity(formFields.PASSWORD);
  }

  if (!confirmPasswordFieldValidity.valid) {
    reportFieldInvalidity(
      formFields.CONFIRM_PASSWORD,
      confirmPasswordFieldValidity.msg
    );
  } else {
    reportFieldValidity(formFields.CONFIRM_PASSWORD);
  }

  if (!passwordFieldValidity.valid || !confirmPasswordFieldValidity.valid) {
    changeActiveFormStep(formSteps.STEP_TWO);
    return;
  }

  try {
    const response = await fetch("/register", {
      method: "POST",
      headers: {
        Accepts: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: emailFieldElm.value,
        password: passwordFieldElm.value,
        username: usernameFieldElm.value,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      handleServerErrors(data.error);
    }

    if (response.redirected) {
      window.location.href = response.url;
    } else {
      handleServerErrors([
        { path: "form", msg: "Failed to create account. Try again!" },
      ]);
    }
  } catch (error) {
    console.error(error);
    handleServerErrors([
      { path: "form", msg: "Something went wrong. Please try again!" },
    ]);
  }
}

usernameFieldElm.addEventListener("blur", (e) => {
  if (e.relatedTarget && e.relatedTarget.href) return;

  const usernameValidity = usernameFieldValid();

  if (!usernameValidity.valid) {
    reportFieldInvalidity(formFields.USERNAME, usernameValidity.msg);
  } else {
    reportFieldValidity(formFields.USERNAME);
  }
});

usernameFieldElm.addEventListener("focus", () => {
  clearFieldValidityStatus(formFields.USERNAME);
});

emailFieldElm.addEventListener("blur", (e) => {
  if (e.relatedTarget && e.relatedTarget.href) return;

  const emailValidity = emailFieldValid();

  if (!emailValidity.valid) {
    reportFieldInvalidity(formFields.EMAIL, emailValidity.msg);
  } else {
    reportFieldValidity(formFields.EMAIL);
  }
});

emailFieldElm.addEventListener("focus", () => {
  clearFieldValidityStatus(formFields.EMAIL);
});

passwordFieldElm.addEventListener("input", () => {
  if (confirmPasswordFieldElm.value.length > 0) {
    if (!passwordsMatch()) {
      reportFieldInvalidity(
        formFields.CONFIRM_PASSWORD,
        "Passwords do not match"
      );
    } else {
      reportFieldValidity(formFields.CONFIRM_PASSWORD);
    }
  }

  updatePasswordRequirementsList();
});

passwordFieldElm.addEventListener("focus", () => {
  togglePasswordRequirementsVisibility();
  clearFieldValidityStatus(formFields.PASSWORD);
});

passwordFieldElm.addEventListener("blur", (e) => {
  if (e.relatedTarget && e.relatedTarget.href) return;

  const passwordFieldValidity = passwordFieldValid();

  if (!passwordFieldValidity.valid) {
    reportFieldInvalidity(formFields.PASSWORD, passwordFieldValidity.msg);
  } else {
    reportFieldValidity(formFields.PASSWORD);
  }
  togglePasswordRequirementsVisibility();
});

confirmPasswordFieldElm.addEventListener("focus", () => {
  clearFieldValidityStatus(formFields.CONFIRM_PASSWORD);
});

confirmPasswordFieldElm.addEventListener("blur", (e) => {
  if (e.relatedTarget && e.relatedTarget.href) return;

  const fieldValidity = confirmPasswordFieldValid();

  if (!fieldValidity.valid) {
    reportFieldInvalidity(formFields.CONFIRM_PASSWORD, fieldValidity.msg);
  } else {
    reportFieldValidity(formFields.CONFIRM_PASSWORD);
  }
});

previousStepBtn.addEventListener("click", () => {
  changeActiveFormStep(formSteps.STEP_ONE);
});

togglePasswordVisibilityElm.addEventListener(
  "change",
  togglePasswordVisibility
);
nextStepBtn.addEventListener("click", handleVerifyFormStepOne);
registerForm.addEventListener("submit", handleFormSubmission);
