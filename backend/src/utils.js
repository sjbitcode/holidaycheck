const moment = require('moment')


const getWeekday = (date) => {
  const holiday = moment(date)
  return holiday._locale._weekdays[holiday.weekday()]
}

const calcDaysFrom = (date) => {
  const holiday = moment(date)
  const today = moment().startOf('day')
  let days = holiday.diff(today, 'days')
  return days
}

const daysFromFmt = (days) => {
  if (days >= 0) {
    return `There are ${days} days until this holiday.`
  }
  else {
    days = Math.abs(days)
    return `This holiday occured ${days} days ago.`
  }
}

const calcMonthDaysFrom = (date) => {
  const holiday = moment(date)
  const today = moment().startOf('day')
  let months = holiday.diff(today, 'months')
  today.add(months, 'months')
  const days = holiday.diff(today, 'days')
  return { months: months, days: days }
}

const monthDaysFromFmt = (monthsDays) => {
  if (monthsDays.months >= 0) {
    return `There are ${monthsDays.months} months and ${monthsDays.days} days until this holiday.`
  }
  else {
    return `This holiday occured ${Math.abs(monthsDays.months)} months and ${Math.abs(monthsDays.days)} days ago.`
  }
}

module.exports = {
  getWeekday,
  calcDaysFrom,
  daysFromFmt,
  calcMonthDaysFrom,
  monthDaysFromFmt
}