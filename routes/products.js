const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();

// Load places data
const loadPlacesData = async () => {
       try {
              const data = await fs.readFile(
                     path.join(__dirname, '../data/places.json'),
                     'utf8'
              );
              return JSON.parse(data);
       } catch (err) {
              console.error('Error loading places data:', err);
              throw err;
       }
};

// Get places that have a specific product
router.get("/:product", async (req, res) => {
       const productName = req.params.product.toLowerCase();

       try {
              const places = await loadPlacesData();
              const results = [];

              places.forEach(place => {
                     const matchingProducts = place.products.filter(product =>
                            product.name.toLowerCase().includes(productName)
                     );

                     if (matchingProducts.length > 0) {
                            results.push({
                                   place: {
                                          name: place.name,
                                          type: place.type,
                                          address: place.address,
                                          longitude: place.location.longitude,
                                          latitude: place.location.latitude,
                                   },
                                   products: matchingProducts
                            });
                     }
              });

              if (results.length === 0) {
                     return res.status(404).json({ error: 'No places found with this product' });
              }

              res.json(results);
       } catch (err) {
              console.error(err);
              res.status(500).json({ error: 'Failed to search for product' });
       }
});

module.exports = router;