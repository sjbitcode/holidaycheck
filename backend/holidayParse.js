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
          holiday[fields[0]] = getTagTexts(rows[i]['children'][j]['children'])
          break;
        case 1:
          holiday[fields[1]] = getTagTexts(rows[i]['children'][j]['children'])
          break;
        case 2:
          holiday[fields[2]] = getTagTexts(rows[i]['children'][j]['children'])
          break
        case 3:
          holiday[fields[3]] = getTagTexts(rows[i]['children'][j]['children'])
          break;
        case 4:
          holiday[fields[4]] = getTagTexts(rows[i]['children'][j]['children'])
          break;
      }
    }

    holidayList.push(holiday)
  }

  return holidayList
}

exports.Hello = 'Hey there!'

exports.color = 'red'