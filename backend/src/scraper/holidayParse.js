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
  // const fields = ['date', 'weekday', 'holidayName', 'holidayType', 'observed']
  const fields = ['date', 'holidayName', 'holidayType', 'observed']
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
          let fullDate = new Date(date)
          holiday[fields[0]] = fullDate
          break;
        // case 1:
        //   // weekday
        //   let weekday = getTagTexts(rows[i]['children'][j]['children'])
        //   holiday[fields[1]] = weekday
        //   break;
        case 2:
          // holiday name
          let name = getTagTexts(rows[i]['children'][j]['children'])
          // holiday[fields[2]] = name
          holiday[fields[1]] = name
          break
        case 3:
          // holiday type
          let type = getTagTexts(rows[i]['children'][j]['children'])
          // holiday[fields[3]] = type
          holiday[fields[2]] = type
          break;
        case 4:
          // observed
          let field4 = getTagTexts(rows[i]['children'][j]['children'])
          if (!validator.isEmpty(field4, { ignore_whitespace: true })) {
            let observed = getTagTexts(rows[i]['children'][j]['children'])
            // holiday[fields[4]] = observed
            holiday[fields[3]] = observed
            break;
          }
      }
    }
    // if not empty object
    if (Object.keys(holiday).length) {
      holidayList.push(holiday)
    }
  }
  return holidayList
}
