const { PrismaClient } = require("../node_modules/@prisma/client");
const prisma = new PrismaClient();

async function readMessages(id) {
  const messages = await prisma.Message.findMany({
    where: {
      OR: [{ senderId: id }, { receiverId: id }],
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  return messages;
}

module.exports = {
  readMessages,
};
