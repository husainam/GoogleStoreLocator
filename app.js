const express = require("express");
const mongoose = require("mongoose");

const Store = require("./api/models/store");
const app = express();
const port = 3000;
const StoreService = require("./api/services/storeService");
const storeService = new StoreService();
require("dotenv").config();

mongoose.connect(
  "mongodb+srv://mongodblogin@cluster0.oaxy6.mongodb.net/test?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
);
app.use(
  express.json({
    limit: "50mb",
  })
);
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});
app.post("/api/stores", (req, res) => {
  let dbStores = [];
  let stores = req.body;
  stores.forEach((store) => {
    dbStores.push({
      storeName: store.name,
      phoneNumber: store.phoneNumber,
      address: store.address,
      openStatusText: store.openStatusText,
      addressLines: store.addressLines,
      location: {
        type: "Point",
        coordinates: [store.coordinates.longitude, store.coordinates.latitude],
      },
    });
  });
  Store.create(dbStores, (err, stores) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(stores);
    }
  });
});

app.get("/api/stores", (req, res) => {
  const zipCode = req.query.zip_code;
  storeService
    .getStoresNear(zipCode)
    .then((stores) => {
      res.status(200).send(stores);
    })
    .catch((error) => {
      console.log(error);
    });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

app.delete("/api/stores", (req, res) => {
  Store.deleteMany({}, (result) => {
    res.status(200).send(result);
  });
});
