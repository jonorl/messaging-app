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

// Create new message
async function postMessages(senderId, text, receiverId, imageUrl = null) {
  const message = await prisma.Message.create({
    data: {
      senderId: senderId,
      text: text,
      receiverId: receiverId,
      imageUrl: imageUrl,
    },
  });
  return message;
}

// get specific-user data using email
async function getUser(email) {
  const user = await prisma.user.findUnique({
    where: { email: email },
  });
  return user;
}

// Create new user
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

// get ALL the users data
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

// get specific-user data using userId
async function getMe(user) {
  const users = await prisma.user.findUnique({
    where: { id: user.userId },
  });
  return users;
}

// Retrieve user's favourites
async function userWithFavourites(userId) {
  const favourites = await prisma.favourite.findMany({
    where: { userId: userId },
  });
  return favourites;
}

// Add/remove user as favourite
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

// Update user profile
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

// Delete user
async function deleteMe(id) {
  const user = await prisma.user.delete({
    where: { id: id },
  });
  return user;
}

// Create new group
async function createGroup(name, memberIds) {
  const group = await prisma.group.create({
    data: {
      name: name,
      members: {
        connect: memberIds.map((id) => ({ id })),
      },
    },
    include: {
      members: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
        },
      },
    },
  });
  return group;
}

// Get messages for a group
async function getGroupMessages(groupId) {
  const messages = await prisma.groupMessage.findMany({
    where: {
      groupId: groupId,
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
        },
      },
    },
  });

  return messages.map((msg) => ({
    id: msg.id,
    text: msg.text,
    image: msg.image,
    createdAt: msg.createdAt,
    senderId: msg.senderId,
    groupId: msg.groupId,
    sender: msg.sender,
  }));
}

// Get all groups for a user
async function getUserGroups(userId) {
  const groups = await prisma.group.findMany({
    where: {
      members: {
        some: {
          id: userId,
        },
      },
    },
    include: {
      members: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return groups;
}

// Get a specific group with members
async function getGroupWithMembers(groupId, userId) {
  const group = await prisma.group.findFirst({
    where: {
      id: groupId,
      members: {
        some: {
          id: userId,
        },
      },
    },
    include: {
      members: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
        },
      },
    },
  });
  return group;
}

async function postGroupMessage(senderId, text, groupId, imageUrl = null) {
  const message = await prisma.groupMessage.create({
    data: {
      senderId: senderId,
      text: text,
      groupId: groupId,
      image: imageUrl
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          profilePicture: true
        }
      }
    }
  });
  return message;
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
  createGroup,
  getGroupMessages,
  getUserGroups,
  getGroupWithMembers,
  postGroupMessage,
};
