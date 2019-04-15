const express = require('express')
require('./db/mongoose')
const User = require('./models/user')
const Task = require('./models/task')
const Holiday = require('./models/holiday')
const { PORT } = require('../config')

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

  // Task.findById(_id).then((task) => {
  //   if (!task) {
  //     return res.status(404).send()
  //   }

  //   res.send(task)
  // }).catch(() => {
  //   res.status(500).send()
  // })
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

  try {
    const holidays = await Holiday.find().limit(10).sort('date').select('-_id -__v')

    if (!holidays) {
      return res.status(400).send()
    }
    res.status(200).send(holidays)

  } catch (e) {
    res.status(500).send('Internal error')
  }
})

app.get('/holidays/search', (req, res) => {
  console.log(req.query)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})