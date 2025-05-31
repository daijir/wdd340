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
  res.render("inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null
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
  res.render("inventory/detail", {
    title: data.inv_make + " " + data.inv_model,
    nav,
    detail,
    errors: null
  })
}

/* ***************************
 *  Build Management view
 * ************************** */
invCont.buildManagement = async function(req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null
  })
}

invCont.buildAddClassification = async function(req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null
  })
}

invCont.buildAddInventory = async function(req, res, next) {
  let nav = await utilities.getNav()
  const classificationsData = await invModel.getClassifications()
  const classifications = classificationsData.rows ? classificationsData.rows : classificationsData
  res.render("inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classifications,
    errors: null
  })
}

/* ****************************************
*  Process adding a new classification
* *************************************** */
invCont.addClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  const classificationResult = await invModel.addNewClassification(
    classification_name
  )

  if (classificationResult) {
    req.flash(
      "notice",
      `Congratulations, you added ${classification_name}. Please log in.`
    )
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry,  we could not add that classification.")
    res.status(501).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
    })
  }
}

/* ****************************************
*  Process adding a new inventory
* *************************************** */
invCont.addInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { 
    inv_make, 
    inv_model, 
    inv_year,
    inv_description, 
    inv_image, 
    inv_thumbnail, 
    inv_price,  
    inv_miles, 
    inv_color,
    classification_id 
  } = req.body

  try {
    const inventoryResult = await invModel.addNewInventory(
      inv_make, 
      inv_model, 
      inv_year,
      inv_description, 
      inv_image, 
      inv_thumbnail, 
      inv_price,  
      inv_miles, 
      inv_color,
      classification_id
    )
    if (inventoryResult) {
      req.flash(
        "notice",
        `Congratulations, you added ${inv_model}!`
      )
      res.status(201).render("inventory/management", {
        title: "Vehicle Management",
        nav,
        errors: null
      })
    } else {
      req.flash("notice", "Sorry,  we could not add that classification.")
      res.status(501).render("inventory/add-classification", {
        title: "Add New Vehicle",
        nav,
        inv_make, 
        inv_model, 
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price, 
        inv_year, 
        inv_miles, 
        inv_color,
        errors: [{ msg: "Failed to add inventory." }]
      })
    }
  } catch (error) {
      console.error("Error in addInventory:", error)
      res.status(500).render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        errors: [{ msg: error.message }]
      })
    }
}

/* ***************************
 *  Intentionally trigger a 500 error
 * ************************** */
invCont.triggerError = async function (req, res, next) {
  throw new Error("This is an intentional 500 error for testing purposes.")
}

module.exports = invCont