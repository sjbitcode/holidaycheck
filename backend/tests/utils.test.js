const moment = require('moment')
const {
  getWeekday,
  calcDaysFrom,
  calcMonthDaysFrom,
  daysFromFmt,
  monthDaysFromFmt
} = require('../src/utils')

test('Should get weekday string from a date', () => {
  // get weekday for the January 1 2019
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const date = new Date(2019, 0, 1)
  date.getDay()
  expect(weekdays[date.getDay()]).toBe(getWeekday(date))
})

test('Should calculate 1 day difference given tomorrow', () => {
  // will calculate days to tomorrow
  const today = new Date()
  const tomorrow = new Date()
  today.setHours(0, 0, 0)
  tomorrow.setHours(0, 0, 0)
  tomorrow.setDate(today.getDate() + 1)
  expect(calcDaysFrom(tomorrow)).toBe(1)
})

test('Should calculate -1 day difference given yesterday', () => {
  // will calculate days from yesterday
  const today = new Date()
  const yesterday = new Date()
  today.setHours(0, 0, 0, 0)
  yesterday.setHours(0, 0, 0, 0)
  yesterday.setDate(today.getDate() - 1)
  expect(calcDaysFrom(yesterday)).toBe(-1)
})

test('Should calculate 0 day difference given today', () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  expect(calcDaysFrom(today)).toBe(0)
})

test('Should calculate 1m difference given 1 month in future', () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const monthInFuture = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
  expect(calcMonthDaysFrom(monthInFuture)).toStrictEqual({
    months: 1,
    days: 0
  })
})

test('Should calculate -1m difference given 1 month ago', () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
  expect(calcMonthDaysFrom(monthAgo)).toStrictEqual({
    months: -1,
    days: 0
  })
})

test('Should calculate 0m difference given today', () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  expect(calcMonthDaysFrom(today)).toStrictEqual({
    months: 0,
    days: 0
  })
})

test('Should calculate 0m 1d difference given tomorrow', () => {
  const today = new Date()
  const tomorrow = new Date()
  today.setHours(0, 0, 0)
  tomorrow.setHours(0, 0, 0)
  tomorrow.setDate(today.getDate() + 1)
  expect(calcMonthDaysFrom(tomorrow)).toStrictEqual({
    months: 0,
    days: 1
  })
})

test('Should format message for a 0 day difference', () => {
  const message = 'There are 0 days until this holiday.'
  expect(daysFromFmt(0)).toBe(message)
})

test('Should format message for a 1 day difference', () => {
  const message = 'There is 1 day until this holiday.'
  expect(daysFromFmt(1)).toBe(message)
})

test('Should format message for a 2 day difference', () => {
  const message = 'There are 2 days until this holiday.'
  expect(daysFromFmt(2)).toBe(message)
})

test('Should format message for 1 month difference', () => {
  expect(monthDaysFromFmt({
    months: 1,
    days: 0
  })).toBe('There are 1 month and 0 days until this holiday.')
})

test('Should format message for 1m 1d difference', () => {
  expect(monthDaysFromFmt({
    months: 1,
    days: 1
  })).toBe('There are 1 month and 1 day until this holiday.')
})

test('Should format message for -1 month difference', () => {
  expect(monthDaysFromFmt({
    months: -1,
    days: 0
  })).toBe('This holiday occured 1 month and 0 days ago.')
})

test('Should format message for -1m -1d difference', () => {
  expect(monthDaysFromFmt({
    months: -1,
    days: -1
  })).toBe('This holiday occured 1 month and 1 day ago.')
})

test('Should format message for 0 month difference', () => {
  expect(monthDaysFromFmt({
    months: 0,
    days: 0
  })).toBe('There are 0 months and 0 days until this holiday.')
})



