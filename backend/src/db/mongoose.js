const mongoose = require('mongoose')
const {DB_URL, DB_NAME} = require('../../config')

const connectionURL = DB_URL
const databaseName = DB_NAME

mongoose.connect(`${connectionURL}/${databaseName}`, { useNewUrlParser: true, useCreateIndex: true })
