const mongoose = require('mongoose')
const moment = require('moment')
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')

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

// holidaySchema.index({ '$**': 'text' })
holidaySchema.virtual('calcWeekday').get(function() {
  const date = moment(this.date)
  return date._locale._weekdays[date.weekday()]
})

holidaySchema.virtual('daysFrom').get(function() {
  const date = moment(this.date)
  const today = moment().startOf('day')
  let days = date.diff(today, 'days')
  return days
})

holidaySchema.set('toJSON', { virtuals: true })
holidaySchema.set('toObject', { virtuals: true, getters: true })

holidaySchema.plugin(aggregatePaginate)

module.exports = mongoose.model('Holiday', holidaySchema)
