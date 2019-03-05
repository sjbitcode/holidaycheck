const mongoose = require('mongoose')

const holidaySchema = {
  date: {
    type: String,
    required: true
  },
  weekday: {
    type: String,
    required: true,
    trim: true
  },
  holidayName: {
    type: String,
    required: true,
    trim: true
  },
  holidayType: {
    type: String,
    required: true,
    trim: true
  },
  observed: {
    type: String,
    trim: true
  }
}
Holiday = mongoose.model('Holiday', holidaySchema)

module.exports = Holiday
