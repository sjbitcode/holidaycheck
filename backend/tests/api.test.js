const request = require('supertest')
const app = require('../src/app')

test('Test root endpoint 200 status', async () => {
  await request(app)
          .get('/')
          .expect('Content-Type', /json/)
          .expect(200)
})

test('Test holidays list endpoint 200 status', async () => {
  await request(app)
          .get('/holidays')
          .expect('Content-Type', /json/)
          .expect(200)
})

test('Test holidays stats endpoint 200 status', async () => {
  await request(app)
          .get('/holidays/stats')
          .expect('Content-Type', /json/)
          .expect(200)
})

test('Test holidays types endpoint 200 status', async () => {
  await request(app)
          .get('/holidays/types')
          .expect('Content-Type', /json/)
          .expect(200)
})