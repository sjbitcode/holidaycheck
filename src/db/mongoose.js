const mongoose = require('mongoose')

const connectionURL = process.env.DB_URL
const databaseName = process.env.DB_NAME

mongoose.connect(`${connectionURL}/${databaseName}`, { useNewUrlParser: true, useCreateIndex: true })
