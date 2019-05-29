const express = require('express')
const router = new express.Router()
const Holiday = require('../models/holiday')
const {
  typesPipeline,
  statsPipeline,
  holidayByIdPipeline,
  holidayPipelineWrapper
} = require('../pipelines')
const {
  getWeekday,
  calcDaysFrom,
  daysFromFmt,
  calcMonthDaysFrom,
  monthDaysFromFmt
} = require('../utils')

router.get('/', (req, res) => {
  const endpoints = {
    'List of holidays': '/holidays',
    'List of holiday types': '/holidays/types',
    'Holiday stats': '/holidays/stats'
  }
  res.status(200).send(endpoints)
})

router.get('/holidays/types', async (req, res) => {
  try {
    const holidayTypes = await Holiday.aggregate(typesPipeline())
    res.send(holidayTypes)
  } catch (e) {
    res.status(500).send()
  }
})

router.get('/holidays/stats', async (req, res) => {
  try {
    const holidayCategories = await Holiday.aggregate(statsPipeline())
    res.send(holidayCategories)
  } catch (e) {
    res.status(500).send()
  }
})

router.get('/holidays', async (req, res) => {
  let {
    name, type, date, month, after,
    before, sort, peek, page
  } = req.query

  // Pagination settings
  const customLabels = {
    totalDocs: 'totalHolidays',
    docs: 'holidays'
  }
  const options = {
    page: page,
    limit: 20,
    customLabels
  }

  try {
    const pipeline = holidayPipelineWrapper(name, type, date, month,
      after, before, peek, sort)
    const holidays = Holiday.aggregate(pipeline)
    const paginatedResults = await Holiday.aggregatePaginate(holidays, options)

    if (!holidays) {
      return res.status(400).send()
    }
    res.status(200).send(paginatedResults)

  } catch (e) {
    res.status(500).send()
  }
})

router.get('/holidays/:id', async (req, res) => {
  const id = req.params.id
  try {
    const holiday = await Holiday.aggregate(holidayByIdPipeline(id))
    if (!holiday) {
      return res.status(404).send()
    }

    /* 
      Calculate weekday, days & month difference from holiday date.
    */
    // 1. Get date and calculate days and month difference
    const date = (holiday[0]['date'])
    let daysFrom = calcDaysFrom(date)
    let monthDaysFrom = calcMonthDaysFrom(date)

    // 2. Add new fields for weekday, days & month difference in response
    holiday[0]['weekday'] = getWeekday(date)
    holiday[0]['daysDifference'] = daysFrom
    holiday[0]['monthsDifference'] = monthDaysFrom
    holiday[0]['daysDifferenceFormatted'] = daysFromFmt(daysFrom)
    holiday[0]['monthsDifferenceFormatted'] = monthDaysFromFmt(monthDaysFrom)
    res.send(holiday)
  } catch (e) {
    res.status(500).send()
  }
})

module.exports = router