const utilities = require("../utilities")

module.exports = function(requiredTypes = []) {
  return async function(req, res, next) {
    const account = req.session.account
    let nav = await utilities.getNav()
    if (account && requiredTypes.includes(account.account_type)) {
      return next()
    }
    req.flash('notice', 'You do not have permission. Please log in.')
    return res.status(403).render('account/login', {
      title: 'Login',
      nav
    })
  }
}