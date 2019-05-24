const express = require('express')
require('./db/mongoose')
const User = require('./models/user')
const Task = require('./models/task')
const Holiday = require('./models/holiday')
const { PORT } = require('../config')
const mongoose = require('mongoose')
const moment = require('moment')
const ObjectId = mongoose.Types.ObjectId

const app = express()
const port = PORT

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!!!')
})

app.get('/now', (req, res, next) => {
  const dateObj = { timeInMs: Date.now() }
  res.send(dateObj)
})

app.post('/users', async (req, res) => {
  const user = new User(req.body)

  try {
    await user.save()
    res.status(201).send(user)
  } catch (e) {
    res.status(400).send(e)
  }
  // user.save().then(() => {
  //   res.status(201).send(user)
  // }).catch((err) => {
  //   res.status(400).send(e)
  // })
})

app.get('/users', async (req, res) => {
  try {
    const users = await User.find({})
    res.send(users)
  } catch (e) {
    res.send(500).send()
  }

  // User.find({}).then((users) => {
  //   res.send(users)
  // }).catch(() => {
  //   res.status(500).send()
  // })
})

app.get('/users/:id', async (req, res) => {
  const _id = req.params.id

  try {
    const user = await User.findById(_id)
    if (!user) {
      return res.status(404).send()
    }

    res.send(user)
  } catch (e) {
    res.status(500).send()
  }
  
  // User.findById(_id).then((user) => {
  //   if (!user) {
  //     return res.status(404).send()
  //   }

  //   res.send(user)
  // }).catch((e) => {
  //   res.status(500).send()
  // })
})

app.patch('/users/:id', async (req, res) => {
  // console.log(req.body)
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age']
  const isValidOperation = updates.every()

  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    if(!user) {
      return res.status(404).send()
    }

    res.send(user)

  } catch (e) {
    res.status(400).send(e)
  }
})

app.get('/tasks', async (req, res) => {

  try {
    const tasks = await Task.find({})
    res.send(tasks)
  } catch (e) {
    res.status(500).send()
  }

  // Task.find({}).then((tasks) => {
  //   res.send(tasks)
  // }).catch((e) => {
  //   res.status(500).send()
  // })

})

app.get('/tasks/:id', async (req, res) => {
  // console.log(req.params.id)
  const _id = req.params.id

  try {
    const task = await Task.findById(_id)
    if (!task) {
      return res.status(404).send()
    }
    res.send(task)
  } catch (e) {
    res.status(500).send()
  }
})

app.post('/tasks', (req, res) => {
  const task = new Task(req.body)
  task.save().then(() => {
    res.status(201).send(task)
  }).catch((err) => {
    res.status(400).send(err)
  })
})

app.get('/holidays/types', async (req, res) => {
  try {
    const holidayTypes = await Holiday.aggregate([
      { 
        $group: {
          _id: null,
          types: { $addToSet: "$holidayType" }
        }
      },
      {
        $project: { "_id": 0 }
      }
    ])
    res.send(holidayTypes)
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
  // console.log('weekday', weekday)
  console.log('month', month)
  console.log('after', after)
  console.log('before', before)
  console.log('sortBy', sortBy)
  console.log('peek', peek)

  const queries = []
  const sort = {}
  const options = {
    page: page,
    limit: 10
  }

  if (sortBy) {
    const parts = sortBy.split(':')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }
  else {
    sort['date'] = 1
  }

  if (name) queries.push({ holidayName: { $regex: name, $options: 'i' } })

  if (type) queries.push({ holidayType: { $regex: type, $options: 'i' } })

  // if (weekday) queries.push({ weekday: { $regex: weekday, $options: 'i' } })

  /*
    If  (date, month, after, before) are passed together,
    the date is queried based on the following prority:
      1 - date
      2 - month
      3 - after/before
  */
  if (date) {
    // cannot query by specific date, query between date and next day
    // const onDate = new Date(date)
    const onDate = moment(date)
    // const dayAfter = new Date(onDate.toString())
    const dayAfter = moment(onDate).add(1, 'days')
    // dayAfter.setDate(onDate.getDate() + 1)

    queries.push(
      { date: { $gte: new Date(onDate), $lt: new Date(dayAfter) } }
    )
  }
  else if (month) {
    // JS months start from 0
    // month = month - 1

    const firstDay = moment(month, 'M')
    const lastDay = moment(firstDay).endOf('month')

    // get first and last days of the month
    // const year = new Date().getFullYear()
    // const firstDay = new Date(year, month, 1)
    // const lastDay = new Date(year, month + 1, 0)

    queries.push(
      { date:  { $gte: new Date(firstDay), $lte: new Date(lastDay) } }
    )
  }
  else if (after || before) {
    let dateQuery = { date: {} }

    if (after) {
      console.log(new Date(after))
      // dateQuery.date['$gt'] = new Date(after)
      dateQuery.date['$gt'] = new Date(moment(after))
    }
    if (before) {
      // dateQuery.date['$lt'] = new Date(before)
      dateQuery.date['$lt'] = new Date(moment(before))
    }

    queries.push(dateQuery)
  }
  else if (peek) {
    const today = moment().startOf('day')
    const peekTo = moment(today).add(peek, 'days')
    queries.push(
      { date: { $gte: new Date(today), $lte: new Date(peekTo) } }
    )
  }

  console.log(queries)

  try {
    // const holidays = await Holiday.find({
    //   $and: queries
    // }).limit(10).sort('date').select('-__v')
    // let holidays = undefined

    let pipelineStages = [
      {
        $project: {
          _id: 0,
          id: "$_id",
          name: "$holidayName",
          type: "$holidayType",
          date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }
        }
      },
      // { $limit: 20 },
      // { $sort: { date: 1 } }
      { $sort: sort }
    ]

    if (queries.length) {
      pipelineStages.unshift(
        { $match: { $and: queries } }
      )
      console.log(pipelineStages)
    }

    const holidays = Holiday.aggregate(pipelineStages)
    const holidaysPaginated = await Holiday.aggregatePaginate(holidays, options)

    if (!holidays) {
      return res.status(400).send()
    }
    res.status(200).send(holidaysPaginated)

  } catch (e) {
    res.status(500).send()
  }
})

const getWeekday = (date) => {
  const holiday = moment(date)
  return holiday._locale._weekdays[holiday.weekday()]
}

const daysFrom = (date) => {
  const holiday = moment(date)
  const today = moment().startOf('day')
  let days = holiday.diff(today, 'days')
  return `${days} days`
}

const monthDaysFrom = (date) => {
  const holiday = moment(date)
  const today = moment().startOf('day')
  let months = holiday.diff(today, 'months')
  today.add(months, 'months')
  const days = holiday.diff(today, 'days')
  return `${months} months ${days} days`
}

app.get('/holidays/:id', async (req, res) => {
  const _id = req.params.id
  try {
    const holiday = await Holiday.aggregate([
      { $match: { _id: ObjectId(_id) } },
      {
        $project: {
          _id: 0,
          id: "$_id",
          name: "$holidayName",
          type: "$holidayType",
          date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          // weekday: "$weekday",
          observed: {
            $cond: [
              { $gt: ["$observed", null] },
              {
                $cond: [
                  { $gt: ["$footnote", null] },
                  { locations: "$observed", footnote: "$footnote" },
                  // { locations: "$observed" },
                  "$observed"
                ]
            },
            "$$REMOVE"
            ]
          },
        }
      }
    ])
    if (!holiday) {
      return res.status(404).send()
    }
    console.log('BEFORE SENDING BACK TO CLIENT')
    const date = (holiday[0]['date'])
    holiday[0]['weekday'] = getWeekday(date)
    holiday[0]['days difference'] = daysFrom(date)
    holiday[0]['month difference'] = monthDaysFrom(date)
    res.send(holiday)
  } catch (e) {
    res.status(500).send()
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})