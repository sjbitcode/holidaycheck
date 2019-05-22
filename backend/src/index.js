const express = require('express')
require('./db/mongoose')
const User = require('./models/user')
const Task = require('./models/task')
const Holiday = require('./models/holiday')
const { PORT } = require('../config')
const mongoose = require('mongoose')
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

app.get('/holidays', async (req, res) => {

  console.log('Going to get holidays')
  console.log(req.query)

  let { name, type, date, weekday, month, after, before } = req.query

  console.log('name', name)
  console.log('type', type)
  console.log('date', date)
  console.log('weekday', weekday)
  console.log('month', month)
  console.log('after', after)
  console.log('before', before)

  const queries = []

  if (name) queries.push({ holidayName: { $regex: name, $options: 'i' } })

  if (type) queries.push({ holidayType: { $regex: type, $options: 'i' } })

  if (weekday) queries.push({ weekday: { $regex: weekday, $options: 'i' } })

  /*
    If  (date, month, after, before) are passed together,
    the date is queried based on the following prority:
      1 - date
      2 - month
      3 - after/before
  */
  if (date) {
    // cannot query by specific date, query between date and next day
    const onDate = new Date(date)
    const dayAfter = new Date(onDate.toString())
    dayAfter.setDate(onDate.getDate() + 1)

    queries.push(
      { date: { $gte: onDate, $lt: dayAfter } }
    )
  }
  else if (month) {
    // JS months start from 0
    month = month - 1

    // get first and last days of the month
    const year = new Date().getFullYear()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    queries.push(
      { date:  { $gte: firstDay, $lte: lastDay } }
    )
  }
  else if (after || before) {
    let dateQuery = { date: {} }

    if (after) {
      console.log(new Date(after))
      dateQuery.date['$gt'] = new Date(after)
    }
    if (before) {
      dateQuery.date['$lt'] = new Date(before)
    }

    queries.push(dateQuery)
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
      { $limit: 20 },
      { $sort: { date: 1 } }
    ]

    if (queries.length) {
      pipelineStages.unshift(
        { $match: { $and: queries } }
      )
      console.log(pipelineStages)
    }

    const holidays = await Holiday.aggregate(pipelineStages)

    if (!holidays) {
      return res.status(400).send()
    }
    res.status(200).send(holidays)

  } catch (e) {
    res.status(500).send()
  }
})

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
          weekday: "$weekday",
          observed: {
            $cond: [
              { $gt: ["$observed", null] },
              {
                $cond: [
                  { $gt: ["$footnote", null] },
                  { locations: "$observed", footnote: "$footnote" },
                  { locations: "$observed" },
                ]
            },
            "$$REMOVE"
            ]
          },
        }
      },
      { $limit: 1 }
    ])
    if (!holiday) {
      return res.status(404).send()
    }
    res.send(holiday)
  } catch (e) {
    res.status(500).send()
  }
})

app.get('/holidays/types', async (req, res) => {
  // console.log(req.query)
  try {
    const holidayTypes = await Holiday.distinct('holidayType')
    res.send(holidayTypes)
  } catch (e) {
    res.status(500).send()
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})