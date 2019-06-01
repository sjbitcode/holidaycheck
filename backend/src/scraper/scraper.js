const rp = require('request-promise')
const $ = require('cheerio')
const holidayParse = require('./holidayParse')


const URL = 'https://www.timeanddate.com/holidays/us/'


const holidayData = rp(URL).then(html => {
  const table = $('table#holidays-table', html)
  const tbody = table.find('tbody')
  const tfooter = table.find('tfoot')

  // Parse the table body rows
  const holidaysList = holidayParse.getHolidays(tbody.children())

  // Parse the table footer
  const footnotes = holidayParse.getFootnotes(tfooter)
  
  return {
    'holidays': holidaysList,
    'footnotes': footnotes,
    'count': holidaysList.length
  }
})


module.exports = holidayData