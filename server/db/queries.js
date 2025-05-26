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
  }));
}

async function postMessages(senderId, text, receiverId) {
  const message = await prisma.Message.create({
    data: { senderId: senderId, text: text, receiverId: receiverId },
  });
  return message;
}

async function getUser(email) {
  const user = await prisma.user.findUnique({
    where: { email: email },
  });
  return user;
}

module.exports = {
  readMessages,
  postMessages,
  getUser,
};
