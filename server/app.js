// Config

require('dotenv').config();

const { startOnlineUsersCleanup } = require('./utils/onlineUsers');

// Express setup
const express = require("express");
const path = require('path')
const app = express();

// CORS setup
const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Start the in-memory track of online users
startOnlineUsersCleanup();

// Router triggering
const mainRouter = require("./routes/mainRouter");
app.use("/", mainRouter);

PORT_MESSAGING = process.env.PORT_MESSAGING || 8081

// Launch and port confirmation
app.listen(PORT_MESSAGING, () =>
  console.log(`Listeining on port ${PORT_MESSAGING}`)
);