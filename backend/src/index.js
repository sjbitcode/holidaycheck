const express = require('express')
require('./db/mongoose')

const app = express()
const port = 3000

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "http://localhost:8080");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!!!')
})

app.get('/now', (req, res, next) => {
  const dateObj = { timeInMs: Date.now() }
  // res.json(dateObj)
  res.send(dateObj)
})

app.post('/users', (req, res) => {
  console.log(req.body)
  res.send('testing')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})