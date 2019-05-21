require('./mongoose')
// const addFootnote = require('./addFootnote')
const holidayData = require('../scraper/scraper')
const Holiday = require('../models/holiday')


const seedData = async () => {
  // scrape holidays and insert
  const scrapedData = await holidayData
  const inserted = await Holiday.insertMany(scrapedData.holidays)

  // add footnote to all holidays with an "*" in observance field
  const updated = await Holiday.updateMany(
    { observed: { $in: [/w*(\*+)w*/] } },
    { "footnote": scrapedData.footnotes }
  )
  return updated
}

seedData().then(res => {
  console.log(res)
})