const validator = require('validator')

const getTagTexts = (tagObjList) => {
  let dataText = ''

  for (let l = 0; l < tagObjList.length; l++) {
    const tagObj = tagObjList[l]

    if (tagObj['type'] !== 'text') {
      // go through all their children objects, and get the data text
      for (let j = 0; j < tagObj['children'].length; j++) {
        dataText += tagObj['children'][j]['data']
      }
    }
    else {
      dataText += tagObj['data']
    }
  }
  return dataText
}

exports.getFootnotes = (footer) => {
  const footerChildren = footer['0']['children'][0]['children'][0]['children']
  return getTagTexts(footerChildren.slice(0, footerChildren.length - 1))
}

exports.getHolidays = (rows) => {
  const fields = ['date', 'weekday', 'holidayName', 'holidayType', 'observed']
  let holidayList = []

  // Iterate through each row
  for (let i = 0; i < rows.length; i++) {
    const holiday = {}

    // Iterate through each row's children field which is a list of th and td objects
    for (let j = 0; j < rows[i]['children'].length; j++) {

      switch (j) {
        case 0:
          // holiday date
          let date = getTagTexts(rows[i]['children'][j]['children']) + ' 2019'
          date = validator.toDate(date)
          holiday[fields[0]] = date
          break;
        case 1:
          // weekday
          holiday[fields[1]] = getTagTexts(rows[i]['children'][j]['children'])
          break;
        case 2:
          // holiday name
          holiday[fields[2]] = getTagTexts(rows[i]['children'][j]['children'])
          break
        case 3:
          // holiday type
          holiday[fields[3]] = getTagTexts(rows[i]['children'][j]['children'])
          break;
        case 4:
          // observed
          let field4 = getTagTexts(rows[i]['children'][j]['children'])
          if (!validator.isEmpty(field4, { ignore_whitespace: true })) {
            holiday[fields[4]] = getTagTexts(rows[i]['children'][j]['children'])
            break;
          }
      }
    }

    holidayList.push(holiday)
  }
  return holidayList
}

exports.Hello = 'Hey there!'

exports.color = 'red'