const mongoose = require('mongoose')

const holidaySchema = new mongoose.Schema({
  date: {
    type: Date,
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
  },
  footnote: {
    type: String,
    trim: true
  }
});

holidaySchema.index({ '$**': 'text' })

module.exports = mongoose.model('Holiday', holidaySchema)
