const sls = require('serverless-http')
const app = require('./src/app')

const handler = sls(app)

module.exports.server = async (event, context) => {
  return await handler(event, context)
}
