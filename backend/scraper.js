const rp = require('request-promise')
const $ = require('cheerio')
const url = 'https://www.timeanddate.com/holidays/us/'
const holidayParse = require('./holidayParse')

rp(url)
  .then(html => {
    const table = $('table', html)
    const tbody = table.find('tbody')
    const tfooter = table.find('tfoot')

    // Parse the table body rows
    const holidaysList = holidayParse.getHolidays(tbody.children())

    // Parse the table footer
    const footnotes = holidayParse.getFootnotes(tfooter)
    
    return {
      'holidays': holidaysList,
      'footnotes': footnotes
    }
  })
  .then(resultObj => {
    console.log(resultObj)

    // write to db here
  })
  .catch(err => console.log(err))