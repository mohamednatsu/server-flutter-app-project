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

// Get all places
router.get("/", async (req, res) => {
       try {
              const places = await loadPlacesData();
              res.json(places);
       } catch (err) {
              console.error(err);
              res.status(500).json({ error: 'Failed to fetch places' });
       }
});

// Filter places by type
router.get("/:type", async (req, res) => {
       const type = req.params.type.toLowerCase();

       try {
              const places = await loadPlacesData();
              const filteredPlaces = places.filter(place =>
                     place.type.toLowerCase() === type
              );

              if (filteredPlaces.length === 0) {
                     return res.status(404).json({ error: 'No places found for this type' });
              }

              res.json(filteredPlaces);
       } catch (err) {
              console.error(err);
              res.status(500).json({ error: 'Failed to filter places' });
       }
});

module.exports = router;