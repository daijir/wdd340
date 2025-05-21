const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory detail view
 * ************************** */

invCont.buildByInventoryId = async function (req, res, next) {
  const invId = req.params.invId
  const data = await invModel.getInventoryById(invId)
  let nav = await utilities.getNav()
  if (!data) {
    return res.status(404).render("errors/404", { nav, title: "Not Found" })
  }
  const detail = await utilities.buildDetailView(data)
  res.render("./inventory/detail", {
    title: data.inv_make + " " + data.inv_model,
    nav,
    detail,
  })
}

module.exports = invCont