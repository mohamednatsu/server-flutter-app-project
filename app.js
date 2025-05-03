const express = require('express');
const prisma = require('./db.js');
const fs = require('fs');
const path = require('path');
app = express();

app.use(express.json());


app.use("/api/auth", require("./routes/auth.js"));

const PORT = 5000;


app.get("/api/places", async (req, res) => {
       fs.readFile(path.join(__dirname, 'data', 'places.json'), 'utf8', (err, data) => {
              if (err) {
                     console.log(err)
                     return res.status(500).json({ error: 'Failed to load data' });
              }
              res.json(JSON.parse(data));
       });
})


// filter places using type

app.get("/api/places/:type", async (req, res) => {
       const type = req.params.type.toLowerCase();

       if (!type) {
              return res.status(400).json({ error: 'Type is required' });
       }

       fs.readFile(path.join(__dirname, 'data', 'places.json'), 'utf8', (err, data) => {
              if (err) {
                     return res.status(500).json({ error: 'Failed to load data' });
              }

              const places = JSON.parse(data);
              return res.status(200).json(places.filter(place => place.type.toLowerCase() === type));
       })
})

// get the places have the same product

app.get("/api/:product", async (req, res) => {
       const { product } = req.params;
       if (!product) {
              return res.status(400).json({ error: 'Product is required' });
       }

       fs.readFile(path.join(__dirname, 'data', 'places.json'), 'utf8', (err, data) => {
              if (err) {
                     return res.status(500).json({ error: 'Failed to load data' });
              }

              const places = JSON.parse(data);
              const filteredPlaces = places.filter(place =>
                     place.products.some(p =>
                            p.name.toLowerCase() === product.toLowerCase()
                     )
              );

              res.status(200).json(filteredPlaces);
       })
})


app.listen((PORT), () => {
       console.log(`Server is running on port ${PORT}`);
})


