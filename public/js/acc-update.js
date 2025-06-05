const accountUpdateForm = document.querySelector("#accountUpdateForm");
const changePasswordForm = document.querySelector("#changePasswordForm");

function enableSubmitButton(form) {
    const submitButton = form.querySelector("button[type='submit']");
    if (submitButton) {
        submitButton.removeAttribute("disabled");
    }
}

if (accountUpdateForm) {
    accountUpdateForm.addEventListener("change", function () {
        enableSubmitButton(this); 
    });
}

if (changePasswordForm) {
    changePasswordForm.addEventListener("change", function () {
        enableSubmitButton(this); 
    });
}

