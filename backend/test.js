new Promise((resolve, reject) => {
  reject(new Error('Whoops!'))
})
.then(result => console.log('Hey this is the result, ', result))
.catch(error => console.error(error))