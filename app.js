const express = require('express'),
  app = express(),
  config = require('./config'),
  path = require('path'),
  incomingDB = require('./DB/incomingDB.json'),
  dataBase = require('./DB/db.json'),
  fs = require('fs'),
  downloadImage = require('image-downloader'),
  cors = require('cors');

app.use(cors())

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
          `${config.productStorage}/images/${imageId}.jpg`;
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
          `${config.productStorage}/thumbs/${thumbId}.jpg`;
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

    })
    .then((newData) => {
      fs.writeFile('./DB/db.json', JSON.stringify(newData), (err) => {
        if (err) throw err;
        console.log('The DataBase has been saved!');
        console.log(newData)
      });
      res.end("FINISHED!");
    })
    .catch((err) => {
      console.error(err)
    })
})
// end parsing data


app.get('/gethomepagedata', (req, res) => {
  let homepageData = {
    popular: getPopular(dataBase.result.data),
    styles: getStyles(dataBase.result.count_by_category.style),
    new: getNew(dataBase.result.data)
  }
  res.end(JSON.stringify(homepageData))
})

app.get('/getcatalogdata', (req, res) => {
  let incomingData = dataBase.result.data,
    allProducts = [],
    totalProducts = 0,
    sizes = [],
    colors = [],
    rooms = [],
    prices = [],
    materials = [],
    constructions = [],
    styles = [];

  incomingData.forEach(function(item) {
    let oldPriceFrom = item.pricing.price.amount,
      oldPriceTo = item.pricing.listPrice.amount,
      discountFrom = item.pricing.price.discount.value,
      discountTo = item.pricing.listPrice.discount.value,
      currencyFrom = item.pricing.price.currency,
      currencyTo = item.pricing.listPrice.currency,
      newColors = [];
    item.properties[1].options.forEach(function(color) {
      if (colors.indexOf(color.value) === -1) {
        colors.push(color.value);
      };
      colors.push(color.value);
      newColors.push(color.value);
    });

    let newItem = {
      name: item.title,
      thumb: item.mediaCollection[0].thumbUrl,
      oldPrice: '$100',
      priceFrom: `${currencyFrom}${Math.round((oldPriceFrom - oldPriceFrom*discountFrom/100)/100)}`,
      priceTo: `${currencyTo}${Math.round((oldPriceTo - oldPriceTo*discountTo/100)/100)}`,
      colors: newColors,
      sizes: item.attributes.sizes,
      rooms: item.attributes.rooms,
      prices: item.attributes.prices,
      material: item.attributes.material,
      construction: item.attributes.construction,
      style: item.attributes.style
    };

    newItem.sizes.forEach((size) => {
      if (sizes.indexOf(size) === -1) {
        sizes.push(size)
      }
    });

    newItem.rooms.forEach((room) => {
      if (rooms.indexOf(room) === -1) {
        rooms.push(room)
      }
    });

    newItem.prices.forEach((price) => {
      if (prices.indexOf(price) === -1) {
        prices.push(price)
      }
    });

    newItem.material.forEach((material) => {
      if (materials.indexOf(material) === -1) {
        materials.push(material)
      }
    });

    newItem.construction.forEach((construction) => {
      if (constructions.indexOf(construction) === -1) {
        constructions.push(construction)
      }
    });

    newItem.style.forEach((style) => {
      if (styles.indexOf(style) === -1) {
        styles.push(style)
      }
    });

    totalProducts++;
    allProducts.push(newItem);
  })
  let catalogData = {
    products: allProducts,
    totalProducts: totalProducts,
    countByCategory: {
      size: sizes,
      color: colors,
      room: rooms,
      price: prices,
      material: materials,
      construction: constructions,
      style: styles
    }
  }

  res.end(JSON.stringify(catalogData))
})


app.listen(config.port)
console.log(`*****Server running at localhost ${config.port}`)

function getPopular(incomingData) {
  let popularProducts = [];
  incomingData.forEach(function(item) {
    let oldPriceFrom = item.pricing.price.amount;
    let oldPriceTo = item.pricing.listPrice.amount;
    let discountFrom = item.pricing.price.discount.value;
    let discountTo = item.pricing.listPrice.discount.value;
    let currencyFrom = item.pricing.price.currency;
    let currencyTo = item.pricing.listPrice.currency;
    let newColors = [];
    item.properties[1].options.forEach(function(color) {
      newColors.push(color.value);
    })

    let newItem = {
      name: item.title,
      thumb: item.mediaCollection[0].thumbUrl,
      oldPrice: '$100',
      priceFrom: `${currencyFrom}${Math.round((oldPriceFrom - oldPriceFrom*discountFrom/100)/100)}`,
      priceTo: `${currencyTo}${Math.round((oldPriceTo - oldPriceTo*discountTo/100)/100)}`,
      colors: newColors
    }
    popularProducts.push(newItem);
  })

  let randomProducts = popularProducts.sort(() => .5 - Math.random())
    .slice(0, 12);
  return randomProducts
}

function getStyles(incomingData) {
  let newData = [];
  for (let key in incomingData) {
    newData.push(key)
  }
  return newData
}

function getNew(incomingData) {
  let newProducts = [];
  incomingData.forEach(function(item) {
    let oldPriceFrom = item.pricing.price.amount;
    let oldPriceTo = item.pricing.listPrice.amount;
    let discountFrom = item.pricing.price.discount.value;
    let discountTo = item.pricing.listPrice.discount.value;
    let currencyFrom = item.pricing.price.currency;
    let currencyTo = item.pricing.listPrice.currency;
    let newColors = [];
    item.properties[1].options.forEach(function(color) {
      newColors.push(color.value);
    })

    let newItem = {
      name: item.title,
      url: item.mediaCollection[0].url,
      oldPrice: '$100',
      priceFrom: `${currencyFrom}${Math.round((oldPriceFrom - oldPriceFrom*discountFrom/100)/100)}`,
      priceTo: `${currencyTo}${Math.round((oldPriceTo - oldPriceTo*discountTo/100)/100)}`,
      colors: newColors
    }
    newProducts.push(newItem);
  })

  let randomProducts = newProducts.sort(() => .5 - Math.random())
    .slice(0, 12);
  return randomProducts
}