// Express set-up
const { Router } = require("express");
const mainRouter = Router();

// Import database queries
const db = require("../db/queries");

// Import Controllers/Middleware
const multer = require("../controllers/multer");
const { validateUser } = require("../controllers/formValidation");
const { authenticateToken } = require("../controllers/authentication");
const { validateImageResolution } = require("../controllers/sharp");

// Import Utils
const { onlineUsers } = require("../utils/onlineUsers");
const generateGuestCredentials = require("../utils/generateGuestUser");
const generateRobotReply = require("../utils/robotReply")

// Import other helper libs
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// GET routes

mainRouter.get("/api/v1/messages/", authenticateToken, async (req, res) => {
  const messages = await db.readMessages(req.user.userId);
  res.json({ messages });
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
    const user = await db.getMe(req.user);
    res.json({ user });
  } catch (err) {
    console.error("Failed to get user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

mainRouter.get("/api/v1/online", authenticateToken, (req, res) => {
  res.json({ online: Array.from(onlineUsers.keys()) });
});

// get group messages
mainRouter.get("/api/v1/groups/:groupId/messages", authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;

    const messages = await db.getGroupMessages(groupId);
    res.json({ messages });
  } catch (err) {
    console.error("Get group messages error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all groups for the authenticated user
mainRouter.get("/api/v1/groups", authenticateToken, async (req, res) => {
  try {
    const groups = await db.getUserGroups(req.user.userId);
    res.json({ groups });
  } catch (err) {
    console.error("Get groups error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a specific group with its members
mainRouter.get("/api/v1/groups/:groupId", authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await db.getGroupWithMembers(groupId, req.user.userId);
    
    if (!group) {
      return res.status(404).json({ message: "Group not found or you're not a member" });
    }

    res.json({ group });
  } catch (err) {
    console.error("Get group error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST routes

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

mainRouter.post(
  "/api/v1/messages/",
  authenticateToken,
  multer.single("image"),
  validateImageResolution,
  async (req, res) => {
    try {
      const senderId = req.body.senderId;
      const text = req.body.text;
      const receiverId = req.body.receiverId;

      // If a file was uploaded, get its path
      const imageUrl = req.file ? `/assets/${req.file.filename}` : null;

      // Save to DB
      const postedMessage = await db.postMessages(
        senderId,
        text,
        receiverId,
        imageUrl
      );

      // This is for the robot user (hardcoded robot's email)
      const robot = await db.getUser("robot@messaging.com");
      if (receiverId == robot.id) {
        setTimeout(async () => {
          await db.postMessages(
            robot.id,
            generateRobotReply(text),
            senderId,
            null
          );
        }, 1000); // simulate delay
      }

      res.json({ postedMessage });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Something went wrong." });
    }
  }
);

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

    // Make it favourite the robot by default
    await db.toggleFavourite(newUser.id, process.env.ROBOT)

    res.status(201).json({ token });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

mainRouter.post("/api/v1/logout", (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});


mainRouter.post("/api/v1/favourite", authenticateToken, async (req, res) => {
  try {
    const favourite = await db.toggleFavourite(
      req.user.userId,
      req.body.favUser
    );
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

mainRouter.post("/api/v1/heartbeat", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  onlineUsers.set(userId, Date.now());
  res.sendStatus(200);
});

mainRouter.post("/api/v1/guest", validateUser, async (req, res) => {
  try {
    const { name, email, password } = generateGuestCredentials();
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

    // Make it favourite the robot by default (hardcoded)
    await db.toggleFavourite(newUser.id, process.env.ROBOT)

    res.status(201).json({ token });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new group 
mainRouter.post("/api/v1/groups", authenticateToken, async (req, res) => {
  try {
    const { name, memberIds } = req.body;
    
    if (!name || !memberIds || !Array.isArray(memberIds)) {
      return res.status(400).json({ message: "Group name and member IDs are required" });
    }

    // Include the creator in the group
    const allMemberIds = [...new Set([req.user.userId, ...memberIds])];

    const newGroup = await db.createGroup(name, allMemberIds);
    res.status(201).json({ group: newGroup });
  } catch (err) {
    console.error("Create group error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

mainRouter.post("/api/v1/groups/:groupId/messages", 
  authenticateToken, 
  multer.single("image"), 
  validateImageResolution,
  async (req, res) => {
    try {
      const { groupId } = req.params;
      const { text } = req.body;
      const senderId = req.user.userId;

      // Check if user is a member of the group
      const group = await db.getGroupWithMembers(groupId, senderId);
      if (!group) {
        return res.status(403).json({ message: "You are not a member of this group" });
      }

      const imageUrl = req.file ? `/assets/${req.file.filename}` : null;
      const message = await db.postGroupMessage(senderId, text, groupId, imageUrl);
      res.json({ message });
    } catch (err) {
      console.error("Send group message error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// PUT routes

mainRouter.put(
  "/api/v1/users",
  authenticateToken,
  multer.single("avatar"),
  validateImageResolution,
  async (req, res) => {
    try {
      const avatar = req.file ? `/assets/${req.file.filename}` : undefined;
      const user = await db.updateUser(
        req.user.userId,
        req.body.name,
        req.body.email,
        avatar
      );
      res.json({ user: { ...user, avatarUrl: user.profilePicture } });
    } catch (err) {
      console.error("Failed to get user:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);


// DELETE routes

mainRouter.delete("/api/v1/me", authenticateToken, async (req, res) => {
  try {
    // Block deletion of guest user
    if (req.user.email === "guest@messaging.com") {
      return res.status(403).json({
        message:
          "The developer has blocked the guest account from being deleted.",
      });
    }
    const user = await db.deleteMe(req.user.userId);
    res.json({ user });
  } catch (err) {
    console.error("Failed to get user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = mainRouter;
