// Config

require('dotenv').config();

// Express setup
const express = require("express");
const path = require('path')
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Router triggering
const mainRouter = require("./routes/mainRouter");
app.use("/", mainRouter);

// Launch and port confirmation
app.listen(process.env.PORT, () =>
  console.log(`Listeining on port ${process.env.PORT}`)
);