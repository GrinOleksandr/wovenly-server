const express = require('express'),
  app = express(),
  config = require('./config'),
  path = require('path'),
  incomingDB = require('./DB/incomingDB.json'),
  fs = require('fs'),
  downloadImage = require('image-downloader'),
  bodyParser = require('body-parser');

// Serve static files
app.use('/img', express.static('img'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.end('Hello from Sasha ;)')
})


// parse data
app.get('/test', (req, res) => {
  function createNewDb() {
    return new Promise(function(resolve, reject) {
      let dataBase = incomingDB.result.data;
      let newDataBase = {};
      newDataBase.status = incomingDB.status;
      newDataBase.result = incomingDB.result;
      resolve(newDataBase)
    })
  }

  createNewDb()
    .then((newData) => {
      for (let i = 0; i < newData.result.data.length; i++) {
        let imageUrl = newData.result.data[i].mediaCollection[0].url;
        let imageId =
          imageUrl.split('/')[3].slice(0, (imageUrl.split('/')[3].indexOf('?')));
        newData.result.data[i].mediaCollection[0].url =
          `localhost:8000/img/${imageId}.jpg`
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
      console.log('***********NEW DATA!!!!', newData)
      fs.writeFile('db.json', newData, (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
      });
      return newData
    })
    .catch((err) => {
      console.error(err)
    })
})




// end parsing data

app.listen(config.port)
console.log(`*****Server running at localhost ${config.port}`)
