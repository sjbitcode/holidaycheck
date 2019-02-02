const MongoClient = require('mongodb').MongoClient

const url = 'mongodb://localhost:27017/'
const dbName = 'testdb'
const collection = 'holidayproject'
 
const addDatabase = (databaseName, collectionName, url) => {
  return MongoClient.connect(`${url}`, { useNewUrlParser: true })
  .then(client => {
    const database = client.db(databaseName)
    // console.log(database)
    console.log('Connection successful!')
    // console.log(typeof (database))
    // console.log(Object.keys(database))

    const collection = database.collection(collectionName)
    const myobj = { name: "Company Inc", address: "Highway 37" }
    collection.insertOne(myobj)

    return client
  })
  // .then(db => {
  //   const collection = db.collection(collectionName)
  //   console.log('Made a collection!')
  //   return db
  // })
  // .then(db => {
  //   const myobj = { name: "Company Inc", address: "Highway 37" }
  //   db.collection(collectionName).insertOne(myobj)
  //   console.log('Inserted stuff into the collection!')
  //   return db
  // })
  .then(client => {
    client.close()
  })
  .catch((err) => {
    console.log('some error!')
    client.close()
    throw(err)
  })
}


addDatabase(dbName, collection, url)
