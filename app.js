const express = require('express'),
  app = express(),
  config = require('./config'),
  path = require('path'),
  incomingDB = require('./DB/incomingDB.json'),
  fs = require('fs'),
  fetch = require('node-fetch'),
  downloadImage = require('image-downloader');

// Serve static files
app.use(express.static(path.join(__dirname, '../public')))

app.get('/', (req, res) => {
  res.end('Hello from Sasha ;)')
})


// parse data
app.get('/test', (req, res) => {
  function refactorDb() {
    return new Promise(function(resolve, reject) {
      let dataBase = incomingDB.result.data;
      let newDataBase = {};
      newDataBase.status = incomingDB.status;
      newDataBase.result = incomingDB.result;
      resolve(newDataBase)
    })
  }
  refactorDb()
    .then((newData) => {
      for (let i = 0; i < newData.result.data.length; i++) {
        let imageUrl = newData.result.data[i].mediaCollection[0].url;
        let imageId =
          imageUrl.split('/')[3].slice(0, (imageUrl.split('/')[3].indexOf('?')));
        newData.result.data[i].mediaCollection[0].url =
          `/img/products/${imageId}.jpg`
        downloadImage.image({
            url: imageUrl,
            dest: path.join(__dirname + `/img/${imageId}.jpg`)
          })
          .then(({
            filename,
            image
          }) => {
            console.log('File saved to', filename);

          })
          .catch((err) => {
            console.error(err)
          })
      }
      console.log('***********DATA!!!!', newData)
      return newData
    })
    .catch((err) => {
      console.error(err)
    })
})




// end parsing data

app.listen(config.port)

console.log(`*****Server running at localhost ${config.port}`)
