const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const accountValidate = require('../utilities/account-validation');

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
  (req, res) => {
    res.status(200).send('login process')
  }
  // utilities.handleErrors(accountController.registerAccount)
)



module.exports = router;