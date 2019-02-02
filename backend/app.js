var express = require('express')
var app = express()
const port = 3000

var dateObj = {timeInMs: Date.now()}

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!!!')
})

app.get('/now', (req, res, next) => {
  res.json(dateObj)
})

app.listen(port, () => console.log(`Example app listening on port ${port}`))