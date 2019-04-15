require('./mongoose')
const holidayData = require('../scraper/scraper')
const Holiday = require('../models/holiday')


// inserts documents to a holidays collection
holidayData.then(resultObj => {
  return Holiday.insertMany(resultObj.holidays)
}).then((result) => {
  console.log(result)
}).catch(error => {
  console.log(error)
})