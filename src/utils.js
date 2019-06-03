const moment = require('moment')

const getWeekday = (date) => {
  // Get weekday string from a date, ex. Monday
  const holiday = moment(date)
  return holiday._locale._weekdays[holiday.weekday()]
}

const calcDaysFrom = (date) => {
  // Calculates the number of days from current day to given date
  const holiday = moment(date)
  const today = moment().startOf('day')
  let days = holiday.diff(today, 'days')
  return days
}

const daysFromFmt = (days) => {
  // Formats string for day difference based on if days is positive or negative
  if (days >= 0) {
    if (days > 1 || days == 0) return `There are ${days} days until this holiday.`
    else return `There is ${days} day until this holiday.`
  }
  else {
    days = Math.abs(days)
    if (days > 1) return `This holiday occured ${days} days ago.`
    else return `This holiday occured ${days} day ago.`
  }
}

const calcMonthDaysFrom = (date) => {
  // Calculates the number of months and days from current day to given date
  const holiday = moment(date)
  const today = moment().startOf('day')
  let months = holiday.diff(today, 'months')
  today.add(months, 'months')
  const days = holiday.diff(today, 'days')
  return { months: months, days: days }
}

const getMonthStr = (months) => {
  // helper function to format month string
  if (months > 1 || months == 0) return `${months} months`
  else return `${months} month`
}

const getDayStr = (days) => {
  // helper function to format day string
  if (days > 1 || days == 0) return `${days} days`
  else return `${days} day`
}

const monthDaysFromFmt = (monthsDays) => {
  // Formats string for month/day difference based on if 
  // month and days are positive or negative
  let months = monthsDays.months
  let days = monthsDays.days

  if (months >= 0) {
    return `There are ${getMonthStr(months)} and ${getDayStr(days)} until this holiday.`
  }
  else {
    months = Math.abs(months)
    days = Math.abs(days)
    return `This holiday occured ${getMonthStr(months)} and ${getDayStr(days)} ago.`
  }
}

module.exports = {
  getWeekday,
  calcDaysFrom,
  daysFromFmt,
  calcMonthDaysFrom,
  monthDaysFromFmt
}