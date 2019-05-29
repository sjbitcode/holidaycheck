const moment = require('moment')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const typesPipeline = () => {
  // Get distinct holiday types
  return [
    {
      $group: {
        _id: null,
        types: { $addToSet: "$holidayType" }
      }
    },
    {
      $project: { "_id": 0 }
    }
  ]
}

const statsCategorizedByType = () => {
  // Group holidays by holiday type and count holidays per type
  return [
    {
      $group: {
        _id: "$holidayType",
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        "_id": 0,
        _type: "$_id",
        _count: "$count"
      }
    },
    {
      $project: {
        type: "$_type",
        count: "$_count"
      }
    },
    {
      $sort: {
        type: 1
      }
    }
  ]
}

const statsCategorizedByMonth = () => {
  /*
    Group holidays per month, count total holidays per
    month, then group by type and count per type.
  */
  return [
    {
      // Group per month and type, and count total
      $group: {
        _id: { "month": { $month: "$date" }, "type": "$holidayType" },
        count: { $sum: 1 }
      }
    },
    {
      // Second grouping, per type per month
      $group: {
        "_id": "$_id.month",
        "totalHolidays": { "$sum": "$count" },
        "holidayTypeCount": {
          "$push": { "type": "$_id.type", "count": "$count" }
        }
      }
    },
    {
      // Format output fields
      $project: {
        _id: 0,
        _holidayTypeCount: "$holidayTypeCount",
        _totalHolidays: "$totalHolidays",
        _month: "$_id",
        _monthString: {
          $let: {
            vars: {
              monthsInString: [, 'January', 'February', 'March', 'April',
                'May', 'June', 'July', 'August', 'September',
                'October', 'November', 'December']
            },
            in: {
              $arrayElemAt: ["$$monthsInString", "$_id"]
            }
          }
        }
      }
    },
    {
      // Ensure order of output fields
      $project: {
        month: "$_month",
        monthString: "$_monthString",
        totalHolidays: "$_totalHolidays",
        holidayTypeCount: "$_holidayTypeCount"
      }
    },
    {
      $sort: {
        month: 1
      }
    }
  ]
}

const statsRemainingHolidays = () => {
  // Get count of holidays from current date onwards
  const today = moment().startOf('day')
  return [
    {
      $match: { date: { $gte: new Date(today) } }
    },
    {
      $count: "totalHolidays"
    }
  ]
}

const statsPipeline = () => {
  // Get multiple aggregations on holidays
  return [
    {
      $facet: {
        "categorizedByType": statsCategorizedByType(),
        "categorizedByMonth": statsCategorizedByMonth(),
        "remaining": statsRemainingHolidays()
      }
    }
  ]
}

const holidayByIdPipeline = (id) => {
  // Aggregate for a single holiday
  return [
    { $match: { _id: ObjectId(id) } },
    {
      $project: {
        _id: 0,
        id: "$_id",
        name: "$holidayName",
        type: "$holidayType",
        date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        observed: {
          $cond: [
            { $gt: ["$observed", null] },
            {
              $cond: [
                { $gt: ["$footnote", null] },
                { locations: "$observed", footnote: "$footnote" },
                "$observed"
              ]
            },
            "$$REMOVE"
          ]
        },
      }
    }
  ]
}

const holidaysDefaultPipeline = (sort) => {
  // Default aggregate for all holidays endpoint
  return [
    {
      $project: {
        _id: 0,
        id: "$_id",
        name: "$holidayName",
        type: "$holidayType",
        date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }
      }
    },
    { $sort: sort }
  ]
}

const holidaysStagesFromQueryParams = (name, type, date, month, after, before, peek) => {
  /* 
    Build aggregate stages from query parameters 
    that will be used together to filter holidays.
  */
  const queries = []
  if (name) queries.push({ holidayName: { $regex: name, $options: 'i' } })
  if (type) queries.push({ holidayType: { $regex: type, $options: 'i' } })
  if (date) {
    // cannot query by specific date, query between date and next day
    const onDate = moment(date)
    const dayAfter = moment(onDate).add(1, 'days')

    queries.push(
      { date: { $gte: new Date(onDate), $lt: new Date(dayAfter) } }
    )
  }
  else if (month) {
    const firstDay = moment(month, 'M')
    const lastDay = moment(firstDay).endOf('month')

    queries.push(
      { date: { $gte: new Date(firstDay), $lte: new Date(lastDay) } }
    )
  }
  else if (after || before) {
    let dateQuery = { date: {} }

    if (after) {
      console.log(new Date(after))
      dateQuery.date['$gt'] = new Date(moment(after))
    }
    if (before) {
      dateQuery.date['$lt'] = new Date(moment(before))
    }

    queries.push(dateQuery)
  }
  else if (peek) {
    const today = moment().startOf('day')
    peek = parseInt(peek)

    // Handle positive or negative peek value
    if (peek >= 0) {
      const peekTo = moment(today).add(peek, 'days')
      queries.push(
        { date: { $gte: new Date(today), $lte: new Date(peekTo) } }
      )
    }
    else {
      const peekFrom = moment(today).subtract(Math.abs(peek), 'days')
      queries.push(
        { date: { $gte: new Date(peekFrom), $lte: new Date(today) } }
      )
    }

  }

  return queries
}

const holidayPipelineWrapper = (name, type, date, month, after, before, peek, sort) => {
  /*
    Create sort pipeline stage from query param, else default to date.
    Can sort by fields name, type, or date.
    Set sorting order by adding ":asc" or ":desc" after the sort field
    in query parameter.
    Ex.
        sort=name:asc
        sort=type:desc
  */
  const sortStage = {}
  if (sort) {
    const parts = sort.split(':')
    sortStage[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }
  else {
    sortStage['date'] = 1
  }
  let pipeline = holidaysDefaultPipeline(sortStage)

  /*
    Build aggregate expressions to match holidays by.
    If  query parameters { date, month, after, before, peek } are passed together,
    only the highest-priority parameter gets applied in the order above.
  */
  const stagesFromQueryParams = holidaysStagesFromQueryParams(name, type, date, month, after, before, peek)
  console.log(stagesFromQueryParams)

  /*
    If query params were passed (array nonempty), add those stages
    from query params in a match stage and add as first stage to default pipeline.
  */
  if (stagesFromQueryParams.length) {
    pipeline.unshift(
      { $match: { $and: stagesFromQueryParams } }
    )
    console.log(pipeline)
  }

  return pipeline
}

module.exports = {
  typesPipeline,
  statsPipeline,
  holidayByIdPipeline,
  holidayPipelineWrapper
}