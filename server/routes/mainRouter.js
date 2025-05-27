const { Router } = require("express");
const mainRouter = Router();
const db = require("../db/queries");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("../controllers/authentication");
const { validateUser } = require("../controllers/formValidation");
const multer = require("../controllers/multer");

mainRouter.post("/api/v1/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.getUser(email);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

mainRouter.get("/api/v1/messages/", authenticateToken, async (req, res) => {
  const messages = await db.readMessages(req.user.userId);
  console.log("messages: ", messages);
  res.json({ messages });
});

mainRouter.post("/api/v1/messages/", authenticateToken, async (req, res) => {
  const senderId = req.body.senderId;
  const text = req.body.text;
  const receiverId = req.body.receiverId;
  const postedMessage = await db.postMessages(senderId, text, receiverId);
  console.log("posted message: ", postedMessage);
  res.json({ postedMessage });
});

mainRouter.post("/api/v1/signup/", validateUser, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await db.getUser(email);
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.createUser(name, email, hashedPassword);

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({ token });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

mainRouter.post("/api/v1/logout", (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});

mainRouter.get("/api/v1/users", async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json({ users });
  } catch (err) {
    console.error("Failed to get users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

mainRouter.get("/api/v1/me", authenticateToken, async (req, res) => {
  try {
    console.log(req.user);
    const user = await db.getMe(req.user);
    res.json({ user });
  } catch (err) {
    console.error("Failed to get user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

mainRouter.post("/api/v1/favourite", authenticateToken, async (req, res) => {
  try {
    const favourite = await db.toggleFavourite(req.user.userId, req.body.favUser);
    res.json({ favourite });
  } catch (err) {
    console.error("Failed to get user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

mainRouter.get("/api/v1/favourite", authenticateToken, async (req, res) => {
  try {
    const favourite = await db.userWithFavourites(req.user.userId);
    const favouriteIdsMap = favourite.reduce((acc, currentFavourite) => {
    acc[currentFavourite.favouriteId] = true;
    return acc;
  }, {}); 
    res.json({ favouriteIdsMap });
  } catch (err) {
    console.error("Failed to get user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

mainRouter.put("/api/v1/users", authenticateToken, multer.single("avatar"), async (req, res) => {
  try {
    const avatar = req.file ? `/uploads/${req.file.filename}` : undefined;
    const user = await db.updateUser(req.user.userId, req.body.name, req.body.email, avatar); 
    res.json({ user: { ...user, avatarUrl: user.profilePicture } });
  } catch (err) {
    console.error("Failed to get user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = mainRouter;
