const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const accountValidate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
accountValidate.registationRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), // on error this message is sent.

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."), // on error this message is sent.

    // valid email is required and cannot already exist in the DB
    body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail() // refer to validator.js docs
    .withMessage("A valid email is required.")
    .custom(async (account_email) => {
    const emailExists = await accountModel.checkExistingEmail(account_email)
    if (emailExists){
        throw new Error("Email exists. Please log in or use different email")
    }
    }),

    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty().withMessage("Password is required.")
      .isLength({ min: 12 }).withMessage("Password must be at least 12 characters.")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
      .withMessage("Password must contain uppercase, lowercase, number, and special character."),
  ]
}

  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
accountValidate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/*  **********************************
  *  Login Data Validation Rules
  * ********************************* */
accountValidate.loginRules = () => {
  return [
    // valid email is required
    body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail() // refer to validator.js docs
    .withMessage("A valid email is required."),

    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
accountValidate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    })
    return
  }
  next()
}

accountValidate.updateAccountRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), // on error this message is sent.

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."), // on error this message is sent.

    // valid email is required and cannot already exist in the DB
    body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail() // refer to validator.js docs
    .withMessage("A valid email is required.")
    .custom(async (account_email) => {
    const emailExists = await accountModel.checkExistingEmail(account_email)
    if (emailExists){
        throw new Error("Email exists. Please log in or use different email")
    }
    })
  ]
}

accountValidate.checkUpdateAccountData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = res.locals.nav
    return res.render("account/update-view", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      account_id: req.body.account_id,
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
      account: req.session.account
    })
  }
  next()
}

accountValidate.passwordRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty().withMessage("Password is required.")
      .isLength({ min: 12 }).withMessage("Password must be at least 12 characters.")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
      .withMessage("Password must contain uppercase, lowercase, number, and special character."),
  ]
}

accountValidate.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = res.locals.nav
    return res.render("account/update-view", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      account_id: req.body.account_id,
      account: req.session.account
    })
  }
  next()
}

module.exports = accountValidate