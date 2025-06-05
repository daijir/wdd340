const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Deliver management view
* *************************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  const accountData = req.session.account;
  if (!accountData) {
    req.flash("notice", "Account data not found in session. Please log in again.");
    return res.redirect("/account/login");
  }
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    account: accountData
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      // added session.loggedin = true when user logged in
      // added session.account = accountData
      req.session.loggedin = true
      req.session.account = accountData
      res.render("account/management", {
        title: "Account Management",
        nav,
        errors: null,
        account: req.session.account
      })
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

async function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie('jwt')
    res.redirect("/")
  })
}

/* ****************************************
*  Deliver update view
* *************************************** */
async function buildUpdateView(req, res, next) {
  let nav = await utilities.getNav()
  const accountData = req.session.account;
  res.render("account/update-view", {
    title: "Update Account",
    nav,
    errors: null,
    account: accountData,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email
  })
}

/* ****************************************
 *  Process update account process
 * ************************************ */
async function updateAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email)
  if (updateResult) {
    req.flash("notice", "Account updated successfully.")
    const accountData = await accountModel.getAccountById(account_id)
    req.session.account = accountData // セッションも更新
    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
      account: accountData
    })
  } else {
    req.flash("notice", "Account update failed.")
    res.render("account/update-view", {
      title: "Update Account",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
      account: req.session.account
    })
  }
}

/* ****************************************
 *  Process changing password
 * ************************************ */
async function updatePassword(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_password } = req.body
  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword)
    if (updateResult) {
      req.flash("notice", "Password updated successfully.")
    } else {
      req.flash("notice", "Password update failed.")
    }
    const accountData = await accountModel.getAccountById(account_id)
    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
      account: accountData
    })
  } catch (error) {
    req.flash("notice", "Error updating password.")
    res.render("account/update-view", {
      title: "Update Account",
      nav,
      errors: [{ msg: "Error updating password." }],
      account_id,
      account: req.session.account
    })
  }
}




module.exports = { buildLogin, buildRegister, buildAccountManagement, registerAccount, accountLogin, logout, buildUpdateView, updateAccount, updatePassword }