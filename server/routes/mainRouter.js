const { Router } = require("express");
const mainRouter = Router();
const db = require("../db/queries");

mainRouter.get("/api/v1/messages/", async (req, res) => {
  const messages = await db.readMessages("5b8872a0-dae5-4a21-8a00-5861f8d446b5");
  console.log("messages: ", messages)
  res.json({ messages });
});

mainRouter.post("/api/v1/messages/", async (req, res) => {
  const senderId = req.body.senderId
  const text = req.body.text
  const receiverId = req.body.receiverId
  const postedMessage = await db.postMessages(senderId, text, receiverId);
  console.log("posted message: ", postedMessage)
  res.json({ postedMessage });
});

module.exports = mainRouter;
