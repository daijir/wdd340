const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const inventoryValidate = require("../utilities/inventory-validation")
const checkAccountType = require('../utilities/checkAccountType')

router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId))
router.get("/", checkAccountType(['Employee', 'Admin']), utilities.handleErrors(invController.buildManagement));
router.get("/add-classification", checkAccountType(['Employee', 'Admin']), utilities.handleErrors(invController.buildAddClassification));
router.get("/add-inventory", checkAccountType(['Employee', 'Admin']), utilities.handleErrors(invController.buildAddInventory))
router.get("/getInventory/:classification_id", checkAccountType(['Employee', 'Admin']), utilities.handleErrors(invController.getInventoryJSON))
router.get("/edit/:inv_id", checkAccountType(['Employee', 'Admin']), utilities.handleErrors(invController.buildEditInventoryView))
router.get("/delete/:inv_id", checkAccountType(['Employee', 'Admin']), utilities.handleErrors(invController.buildDeleteConfirmationView))

router.post(
  '/add-classification',
  inventoryValidate.classificationRules(),
  inventoryValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

router.post(
  '/add-inventory',
  inventoryValidate.inventoryRules(),
  inventoryValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

router.post(
  "/update/", 
  inventoryValidate.inventoryRules(),
  inventoryValidate.checkUpdateData,
  invController.updateInventory)

router.post(
  "/delete/",
  utilities.handleErrors(invController.deleteInventory)
)

router.get("/error", utilities.handleErrors(invController.triggerError))

module.exports = router;