const utilities = require(".")
const { body, validationResult } = require("express-validator")
const inventoryModel = require("../models/inventory-model")
const inventoryValidate = {}

inventoryValidate.classificationRules = () => {  
  return [
    // new classification name cannot contain a space or special character of any kind
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a classification name.")
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("Name must be alphanumeric only. No spaces or special characters.")
      .custom(async (classification_name) => {
        const classificationExists = await inventoryModel.checkExistingClassification(classification_name)
        if (classificationExists) {
          throw new Error("Classification already exists. Please use a different name.")
        }
      }),
  ]
}

inventoryValidate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = []
  const validationErrors = validationResult(req)
  if (!validationErrors.isEmpty()) {
    errors = validationErrors.array()
  }
  if (errors.length > 0) {
    return res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav: await utilities.getNav(),
      errors,
      classification_name
    })
  }
  next()
}

inventoryValidate.inventoryRules = () => {
  return [
    // Make: required, min 3 chars, alphanumeric and spaces only
    body("inv_make")
      .trim()
      .notEmpty().withMessage("Make is required.")
      .isLength({ min: 3 }).withMessage("Make must be at least 3 characters.")
      .matches(/^[a-zA-Z0-9 ]+$/).withMessage("Make must be alphanumeric characters and spaces only."),

    // Model: required, min 3 chars, alphanumeric and spaces only
    body("inv_model")
      .trim()
      .notEmpty().withMessage("Model is required.")
      .isLength({ min: 3 }).withMessage("Model must be at least 3 characters.")
      .matches(/^[a-zA-Z0-9 ]+$/).withMessage("Model must be alphanumeric characters and spaces only."),

    // Description: required
    body("inv_description")
      .trim()
      .notEmpty().withMessage("Description is required."),

    // Image: required, must be a valid URL if provided
    body("inv_image")
      .trim()
      .notEmpty().withMessage("Model is required.")
      .matches(/^\/images\/vehicles\/[a-zA-Z0-9._-]+\.(jpg|jpeg|png|gif)$/)
      .withMessage("Image path must start with /images/vehicles/ and end with a valid image file extension."),

    // Thumbnail: required, must be a valid URL if provided
    body("inv_thumbnail")
      .trim()
      .matches(/^\/images\/vehicles\/[a-zA-Z0-9._-]+\.(jpg|jpeg|png|gif)$/)
      .withMessage("Image path must start with /images/vehicles/ and end with a valid image file extension."),

    // Price: required, must be a number >= 0, only accept positive integer
    body("inv_price")
      .notEmpty().withMessage("Price is required.")
      .isInt({ min: 0 }).withMessage("Price must be a positive integer."),

    // Year: required, must be a 4-digit year between 1900 and 2099
    body("inv_year")
      .notEmpty().withMessage("Year is required.")
      .isInt({ min: 1900, max: 2099 }).withMessage("Year must be a 4-digit year between 1900 and 2099."),

    // Miles: required, must be integer >= 0
    body("inv_miles")
      .notEmpty().withMessage("Miles is required.")
      .isInt({ min: 0 }).withMessage("Miles must be a positive integer."),

    // Color: required, alphabetic only
    body("inv_color")
      .trim()
      .notEmpty().withMessage("Color is required.")
      .matches(/^[a-zA-Z ]+$/).withMessage("Color must be alphabetic characters and spaces only."),
  ]
}

inventoryValidate.checkInventoryData = async (req, res, next) => {
  const { inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body
  let errors = []
  const validationErrors = validationResult(req)
  if (!validationErrors.isEmpty()) {
    errors = validationErrors.array()
  }
  if (errors.length > 0) {
    const nav = await utilities.getNav()
    const classificationsData = await require("../models/inventory-model").getClassifications()
    const classifications = classificationsData.rows ? classificationsData.rows : classificationsData

    return res.render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classifications,
      errors,
      inv_make, 
      inv_model,  
      inv_description,
      inv_image,
      inv_thumbnail,  
      inv_price, 
      inv_year, 
      inv_miles, 
      inv_color
    })
  }
  next()
}



module.exports = inventoryValidate