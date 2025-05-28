const { PrismaClient } = require("../node_modules/@prisma/client");
const prisma = new PrismaClient();

//This query does a "JOIN" with users to return the names of the usersId. Prisma
// returns this as objects, so the map at the bottom parses them as string.
async function readMessages(id) {
  const messages = await prisma.Message.findMany({
    where: {
      OR: [{ senderId: id }, { receiverId: id }],
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      sender: {
        select: { name: true },
      },
      receiver: {
        select: { name: true },
      },
    },
  });
  return messages.map((msg) => ({
    id: msg.id,
    text: msg.text,
    createdAt: msg.createdAt,
    senderId: msg.senderId,
    receiverId: msg.receiverId,
    sender: msg.sender.name,
    receiver: msg.receiver.name,
    imageUrl: msg.imageUrl,
  }));
}

async function postMessages(senderId, text, receiverId, imageUrl=null) {
  const message = await prisma.Message.create({
    data: { senderId: senderId, text: text, receiverId: receiverId, imageUrl: imageUrl },
  });
  return message;
}

async function getUser(email) {
  const user = await prisma.user.findUnique({
    where: { email: email },
  });
  return user;
}

async function createUser(name, email, hashedPassword) {
  const newUser = await prisma.user.create({
    data: {
      name: name,
      email: email,
      passwordHash: hashedPassword,
    },
  });
  return newUser;
}

async function getAllUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      profilePicture: true,
    },
  });
  return users;
}

async function getMe(user) {
  const users = await prisma.user.findUnique({
    where: { id: user.userId },
  });
  return users;
}

async function userWithFavourites(userId) {
  const favourites = await prisma.favourite.findMany({
    where: { userId: userId },
  });
  return favourites;
}

async function toggleFavourite(userId, favouriteId) {
  const existing = await prisma.favourite.findUnique({
    where: {
      userId_favouriteId: {
        userId,
        favouriteId,
      },
    },
  });

  if (existing) {
    await prisma.favourite.delete({
      where: {
        userId_favouriteId: {
          userId,
          favouriteId,
        },
      },
    });
    return { removed: true };
  } else {
    await prisma.favourite.create({
      data: {
        userId,
        favouriteId,
      },
    });
    return { added: true };
  }
}

async function updateUser(id, name, email, profileURL) {
  const user = await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      name: name,
      email: email,
      profilePicture: profileURL,
    },
  });
  return user;
}

async function deleteMe(id) {
  const user = await prisma.user.delete({
    where: { id: id },
  });
  return user;
}

module.exports = {
  readMessages,
  postMessages,
  getUser,
  createUser,
  getAllUsers,
  getMe,
  userWithFavourites,
  toggleFavourite,
  updateUser,
  deleteMe,
};
