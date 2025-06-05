const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const accountValidate = require('../utilities/account-validation');


/* ****************************************
*  Deliver account management view
* *************************************** */
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
)

/* ****************************************
*  Deliver login view
* *************************************** */
router.get("/login", utilities.handleErrors(accountController.buildLogin))

/* ****************************************
*  Deliver registration view
* *************************************** */
router.get("/register", utilities.handleErrors(accountController.buildRegister))

/* ****************************************
*  register a new account
* *************************************** */
router.post(
  '/register',
  accountValidate.registationRules(),
  accountValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

/* ****************************************
*  Process Login
* *************************************** */
router.post(
  "/login",
  accountValidate.loginRules(),
  accountValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

/* ****************************************
*  Process Logout
* *************************************** */
router.get(
  "/logout",
  utilities.handleErrors(accountController.logout)
)

router.get(
  "/update/:account_id",
  utilities.handleErrors(accountController.buildUpdateView)
)

router.post(
  "/update",
  ...accountValidate.updateAccountRules(),
  accountValidate.checkUpdateAccountData,
  utilities.handleErrors(accountController.updateAccount)
)

router.post(
  "/update-password",
  ...accountValidate.passwordRules(),
  accountValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
)


module.exports = router;