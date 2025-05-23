const { Router } = require("express");
const mainRouter = Router();
const db = require("../db/queries");

// Get all character coordinates
mainRouter.get("/api/v1/messages/", async (req, res) => {
  const messages = await db.readMessages("5b8872a0-dae5-4a21-8a00-5861f8d446b5");
  console.log("messages: ", messages)
  res.json({ messages });
});

module.exports = mainRouter;
