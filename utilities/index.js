const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the detailed view HTML
* @param {Object} data
* @returns {string}
* ************************************ */


Util.buildDetailView = async function(data) {
  if (!data) return "<p>Vehicle information not found.</p>"
  const price = Number(data.inv_price).toLocaleString("en-US", { style: "currency", currency: "USD" })
  const miles = data.inv_miles ? Number(data.inv_miles).toLocaleString("en-US") + " miles" : "Mileage not listed"
  return `
    <div class="vehicle-detail">
      <img src="${data.inv_image}" alt="Image of ${data.inv_make} ${data.inv_model}" class="vehicle-image">
      <div class="vehicle-info">
        <h2>${data.inv_year} ${data.inv_make} ${data.inv_model}</h2>
        <h3>Price: <span class="vehicle-price">${price}</span></h3>
        <h3>Mileage: <span class="vehicle-miles">${miles}</span></h3>
        <ul class="vehicle-details-list">
          <li><strong>Make:</strong> ${data.inv_make}</li>
          <li><strong>Model:</strong> ${data.inv_model}</li>
          <li><strong>Year:</strong> ${data.inv_year}</li>
          <li><strong>Color:</strong> ${data.inv_color}</li>
        </ul>
        <h3>Description</h3>
        <p>${data.inv_description}</p>
      </div>
    </div>
  `
}

module.exports = Util


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)