const express = require('express')
const moment = require('moment')

require('./db/mongoose')
const app = express()
const Holiday = require('./models/holiday')
const { PORT } = require('../config')
const { 
  typesPipeline,
  statsPipeline,
  holidayByIdPipeline,
  holidayPipelineWrapper 
} = require('./pipelines')
const {
  getWeekday,
  calcDaysFrom,
  daysFromFmt,
  calcMonthDaysFrom,
  monthDaysFromFmt 
} = require('./utils')


app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!!!')
})

app.get('/holidays/types', async (req, res) => {
  try {
    const holidayTypes = await Holiday.aggregate(typesPipeline())
    res.send(holidayTypes)
  } catch (e) {
    res.status(500).send()
  }
})

app.get('/holidays/stats', async (req, res) => {
  try {
    const holidayCategories = await Holiday.aggregate(statsPipeline())
    res.send(holidayCategories)
  } catch (e) {
    res.status(500).send()
  }
})

app.get('/holidays', async (req, res) => {

  console.log('Going to get holidays')
  console.log(req.query)

  let { name, type, date, month, after, before, sortBy, peek, page } = req.query

  console.log('name', name)
  console.log('type', type)
  console.log('date', date)
  console.log('month', month)
  console.log('after', after)
  console.log('before', before)
  console.log('sortBy', sortBy)
  console.log('peek', peek)

  /* 
    Create sort pipeline stage from query param, else default to date.
    Can sort by fields name, type, or date. 
    Set sorting order by adding ":asc" or ":desc" after the sort field
    in query parameter.
    Ex.
        sortBy=name:asc
        sortBy=type:desc
  */
  // const sort = {}
  // if (sortBy) {
  //   const parts = sortBy.split(':')
  //   sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  // }
  // else {
  //   sort['date'] = 1
  // }
  // let pipeline = holidaysDefaultPipeline(sort)
  
  /* 
    Build aggregate expressions to match holidays by.
    If  query parameters { date, month, after, before, peek } are passed together,
    only the highest-priority parameter gets applied:
      1 - date
      2 - month
      3 - after/before
      4 - peek
  */
  // const stagesFromQueryParams = holidaysStagesFromQueryParams(name, type, date, month, after, before, peek)

  // console.log(stagesFromQueryParams)

  /*
    Create aggregate pipeline with default stages.
    If query params were passed, add those stages 
    from query params in a match stage and add to pipeline.
  */
  // if (stagesFromQueryParams.length) {
  //   pipeline.unshift(
  //     { $match: { $and: stagesFromQueryParams } }
  //   )
  //   console.log(pipeline)
  // }

  /*
    Add custom pagination settings.
    Add page query parameter.
  */
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
    const pipeline = holidayPipelineWrapper(name, type, date, month, after, before, peek, sortBy)
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

app.get('/holidays/:id', async (req, res) => {
  const id = req.params.id
  try {
    const holiday = await Holiday.aggregate(holidayByIdPipeline(id))
    if (!holiday) {
      return res.status(404).send()
    }
    console.log('BEFORE SENDING BACK TO CLIENT')
    const date = (holiday[0]['date'])
    holiday[0]['weekday'] = getWeekday(date)

    let daysFrom = calcDaysFrom(date)
    let monthDaysFrom = calcMonthDaysFrom(date)
    holiday[0]['daysDifference'] = daysFrom
    holiday[0]['monthsDifference'] = monthDaysFrom
    holiday[0]['daysDifferenceFormatted'] = daysFromFmt(daysFrom)
    holiday[0]['monthsDifferenceFormatted'] = monthDaysFromFmt(monthDaysFrom)
    res.send(holiday)
  } catch (e) {
    res.status(500).send()
  }
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Example app listening on port ${PORT}`)
})