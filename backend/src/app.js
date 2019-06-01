const express = require('express')
require('./db/mongoose')
const app = express()
const holidayRouter = require('./routers/holiday')

app.use(express.json())
app.use(holidayRouter)

module.exports = app