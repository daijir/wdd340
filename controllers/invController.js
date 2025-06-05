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
  const classificationSelectData = await invModel.getClassifications()
  const classificationSelect = classificationSelectData.rows ? classificationSelectData.rows : classificationSelectData
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    classificationSelect,
    errors: null
  })
}

/* ***************************
 *  Build Add Classification view
 * ************************** */
invCont.buildAddClassification = async function(req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null
  })
}

/* ***************************
 *  Build Add Inventory view
 * ************************** */
invCont.buildAddInventory = async function(req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelectData = await invModel.getClassifications()
  const classificationSelect = classificationSelectData.rows ? classificationSelectData.rows : classificationSelectData
  res.render("inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classificationSelect,
    errors: null
  })
}

/* ****************************************
*  Process adding a new classification
* *************************************** */
invCont.addClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  try {
    const classificationResult = await invModel.addNewClassification(classification_name)
    req.flash(
      "notice",
      `Congratulations, you added ${classification_name}. Please log in.`
    )
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null
    })
  } catch(error) {
    req.flash("notice", "Sorry,  we could not add that classification.")
    res.status(501).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: error
    })
  }
}

/* ****************************************
*  Process adding a new inventory
* *************************************** */
invCont.addInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelectData = await invModel.getClassifications()
  const classificationSelect = classificationSelectData.rows ? classificationSelectData.rows : classificationSelectData
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
        classificationSelect,
        errors: null
      })
    } else {
      req.flash("notice", "Sorry,  we could not add that classification.")
      res.status(501).render("inventory/add-classification", {
        title: "Add New Vehicle",
        nav,
        classificationSelect,
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Edit Inventory view
 * ************************** */
invCont.buildEditInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const invData = await invModel.getInventoryById(inv_id)
  if (!invData) {
    return res.status(404).render("errors/404", { nav, title: "Not Found" })
  }
  const classificationSelectData = await invModel.getClassifications()
  const classificationSelect = classificationSelectData.rows ? classificationSelectData.rows : classificationSelectData
  const itemName = `${invData.inv_make} ${invData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: invData.inv_id,
    inv_make: invData.inv_make,
    inv_model: invData.inv_model,
    inv_year: invData.inv_year,
    inv_description: invData.inv_description,
    inv_image: invData.inv_image,
    inv_thumbnail: invData.inv_thumbnail,
    inv_price: invData.inv_price,
    inv_miles: invData.inv_miles,
    inv_color: invData.inv_color,
    classification_id: invData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  try {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } catch(error) {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: error,
    inv_id,
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
    })
  }
}

/* ***************************
 *  Delete Inventory view
 * ************************** */
invCont.buildDeleteConfirmationView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const invData = await invModel.getInventoryById(inv_id)
  if (!invData) {
    return res.status(404).render("errors/404", { nav, title: "Not Found" })
  }
  const itemName = `${invData.inv_make} ${invData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: invData.inv_id,
    inv_make: invData.inv_make,
    inv_model: invData.inv_model,
    inv_year: invData.inv_year,
    inv_price: invData.inv_price,
    classification_id: invData.classification_id
  })
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id = parseInt(req.body.inv_id)
  const { inv_make, inv_model, inv_year, inv_price, classification_id } = req.body
  try {
    const deleteResult = await invModel.deleteInventory(inv_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", `The ${itemName} was successfully deleted.`)
    res.redirect("/inv/")
  } catch (error) {
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the delete failed.")
    res.status(501).render("inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: error,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price,
    classification_id
    })
  }
}
module.exports = invCont