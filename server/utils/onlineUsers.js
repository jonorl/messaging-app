// Helper function to keep track of online user in memory every minute.

const onlineUsers = new Map([]);

function startOnlineUsersCleanup(timeout = 60000) {
  setInterval(() => {
    const now = Date.now();
    for (const [userId, lastSeen] of onlineUsers.entries()) {
      if (now - lastSeen > timeout) {
        onlineUsers.delete(userId);
      }
    }
  }, timeout);
}

module.exports = {
  onlineUsers,
  startOnlineUsersCleanup,
};
