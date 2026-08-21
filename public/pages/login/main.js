const togglePasswordElm = document.querySelector("input#toggle");
const passwordElm = document.querySelector("input#password");
const userIdentifierElm = document.querySelector("input#userIdentifier");
const loginForm = document.querySelector("form#login");

const formFields = {
  USER_IDENTIFIER: "userIdentifier",
  PASSWORD: "password",
};

function reportFieldInvalidity(fieldName, msg) {
  const fieldMsgElm = loginForm.querySelector(
    `[data-field-msg='${fieldName}']`
  );
  const fieldElm = loginForm.querySelector(`[data-field-name='${fieldName}']`);

  if (!fieldMsgElm || !fieldElm) return;

  fieldElm.dataset.validity = "invalid";

  fieldMsgElm.classList.remove("hidden");
  fieldMsgElm.textContent = msg;
}

function clearFieldValidityStatus(fieldName) {
  const fieldMsgElm = loginForm.querySelector(
    `[data-field-msg='${fieldName}']`
  );

  const fieldElm = loginForm.querySelector(`[data-field-name='${fieldName}']`);

  if (!fieldMsgElm || !fieldElm) return;

  fieldMsgElm.classList.add("hidden");
  fieldElm.dataset.validity = "default";

  loginForm.dataset.validity = "default";
}

function reportFieldValidity(fieldName) {
  const fieldMsgElm = loginForm.querySelector(
    `[data-field-msg='${fieldName}']`
  );
  const fieldElm = loginForm.querySelector(`[data-field-name='${fieldName}']`);

  if (!fieldMsgElm || !fieldElm) return;

  fieldMsgElm.classList.add("hidden");
  fieldElm.dataset.validity = "valid";
}

function handleTogglePasswordVisibility(event) {
  const visible = event.currentTarget.checked;

  if (visible) {
    passwordElm.type = "text";
  } else {
    passwordElm.type = "password";
  }
}

function isValidEmail(email) {
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email.trim());
}

function userIdentifierFieldValid() {
  const userIdentifier = userIdentifierElm.value.trim();

  if (!userIdentifier || userIdentifier.length === 0)
    return {
      valid: false,
      msg: "Enter a valid email or username",
    };

  if (userIdentifier.includes("@")) {
    // Validate as email
    const isValid = isValidEmail(userIdentifier);
    let msg = "";

    if (!isValid) {
      msg = "Email Address is invalid";
    }

    return {
      valid: isValid,
      msg,
    };
  } else {
    // Validate as username
    const isValid = /^[\w]{3,32}$/.test(userIdentifier);
    let msg = "";

    if (!isValid) {
      msg = "Username is invalid";
    }

    return {
      valid: isValid,
      msg,
    };
  }
}

function passwordFieldValid() {
  const password = passwordElm.value.trim();

  const isValid = password && password.length > 0;
  let msg = "";

  if (!isValid) {
    msg = "Please enter your password";
  }

  return {
    valid: isValid,
    msg,
  };
}

function handleFormSubmissionFailure(errorList) {
  if (!Array.isArray(errorList) || errorList.length === 0) return;

  errorList.forEach((errorDetails) => {
    const { path, msg } = errorDetails;

    if (path === formFields.PASSWORD) {
      reportFieldInvalidity(path, msg);
    } else if (path === formFields.USER_IDENTIFIER) {
      reportFieldInvalidity(path, msg);
    } else {
      const fieldMsgElm = document.querySelector(`[data-field-msg='form']`);

      if (!fieldMsgElm) return;

      loginForm.dataset.validity = "invalid";
      fieldMsgElm.textContent = msg;
    }
  });
}

async function handleFormSubmission(event) {
  event.preventDefault();

  const userIdentifier = userIdentifierElm.value;
  const password = passwordElm.value;

  const userIdentifierValidity = userIdentifierFieldValid();

  if (!userIdentifierValidity.valid) {
    reportFieldInvalidity(
      formFields.USER_IDENTIFIER,
      userIdentifierValidity.msg
    );
  } else {
    reportFieldValidity(formFields.USER_IDENTIFIER);
  }

  const passwordFieldValidity = passwordFieldValid();

  if (!passwordFieldValidity.valid) {
    reportFieldInvalidity(formFields.PASSWORD, passwordFieldValidity.msg);
  } else {
    reportFieldValidity(formFields.PASSWORD);
  }

  if (!userIdentifierValidity.valid || !passwordFieldValidity.valid) {
    // update submit button (disable)
    return;
  }

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        userIdentifier,
        password,
      }),
    });
    const data = await response.json();

    if (Array.isArray(data.errors) && data.errors.length !== 0) {
      handleFormSubmissionFailure(data.errors);
      return;
    }

    if (!response.ok || !data.success) {
      handleFormSubmissionFailure([
        { path: "form", msg: "Failed to login. Please try again!" },
      ]);
      return;
    }

    window.location = data.redirectUrl;
  } catch (error) {
    console.error(error);
    handleFormSubmission([
      {
        path: "form",
        msg: "Error Occurred. Please try again!",
      },
    ]);
  }
}

userIdentifierElm.addEventListener("focus", () => {
  clearFieldValidityStatus(formFields.USER_IDENTIFIER);
});

userIdentifierElm.addEventListener("blur", (e) => {
  if (e.relatedTarget && e.relatedTarget.href) return;

  const userIdentifierValidity = userIdentifierFieldValid();

  if (!userIdentifierValidity.valid) {
    reportFieldInvalidity(
      formFields.USER_IDENTIFIER,
      userIdentifierValidity.msg
    );
  } else {
    reportFieldValidity(formFields.USER_IDENTIFIER);
  }
});

passwordElm.addEventListener("focus", () => {
  clearFieldValidityStatus(formFields.PASSWORD);
});

passwordElm.addEventListener("blur", (e) => {
  if (e.relatedTarget && e.relatedTarget.href) return;

  const passwordValidity = passwordFieldValid();

  if (!passwordValidity.valid) {
    reportFieldInvalidity(formFields.PASSWORD, passwordValidity.msg);
  } else {
    reportFieldValidity(formFields.PASSWORD);
  }
});

togglePasswordElm.addEventListener("change", handleTogglePasswordVisibility);
loginForm.addEventListener("submit", handleFormSubmission);
