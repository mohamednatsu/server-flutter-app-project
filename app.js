const express = require('express');
const path = require('path');
const prisma = require('./db');
const app = express();

app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/places", require("./routes/places"));
app.use("/api/products", require("./routes/products"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});