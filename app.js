const express = require('express'),
  app = express(),
  config = require('./config'),
  path = require('path'),
  incomingDB = require('./DB/incomingDB.json'),
  dataBase = require('./DB/db.json'),
  fs = require('fs'),
  downloadImage = require('image-downloader'),
  bodyParser = require('body-parser');

// Serve static files
app.use('/images', express.static('products/images'));
app.use('/thumbs', express.static('products/thumbs'));


app.get('/', (req, res) => {
  res.end('Hello from woovenly server ;)')
})


// parse images nad thumbs and refactor database links of them.
app.get('/parsedb', (req, res) => {
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
          `${config.productStorage}images/${imageId}.jpg`;
        downloadImage.image({
            url: imageUrl,
            dest: path.join(__dirname + `/products/images/${imageId}.jpg`)
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

          let thumbUrl = newData.result.data[i].mediaCollection[0].thumbUrl;
          let thumbId =
            thumbUrl.split('/')[3].slice(0, (thumbUrl.split('/')[3].indexOf('?')));
          newData.result.data[i].mediaCollection[0].thumbUrl =
            `${config.productStorage}thumbs/${thumbId}.jpg`;
          downloadImage.image({
              url: thumbUrl,
              dest: path.join(__dirname + `/products/thumbs/${thumbId}.jpg`)
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
      // console.log('***********NEW DATA!!!!', newData)
      return newData

    }).then((newData)=>{
      fs.writeFile('./DB/db.json', JSON.stringify(newData), (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
      });
      res.end("FINISHED!");
    })
    .catch((err) => {
      console.error(err)
    })
})
// end parsing data

app.get('/getpopular', (req, res) => {
  let incomingData = dataBase.result.data;
  let popularProducts = [];

  res.end('Hello from Sasha ;)')
})




app.listen(config.port)
console.log(`*****Server running at localhost ${config.port}`)
