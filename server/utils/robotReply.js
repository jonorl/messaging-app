// Helper function for the robot to auto-reply

function generateRobotReply(userMessage) {
  const lower = userMessage.toLowerCase();
  if (lower.includes("hello") || lower.includes("hi")) return "Hello human! 🤖";
  if (lower.includes("how are you")) return "I'm just circuits and code, but thanks for asking!";
  if (lower.includes("bye")) return "Goodbye! Come talk to me anytime.";
  if (lower.includes("shodan")) return "L-l-l-look at you, hacker..."
  return "I'm not actually an AI, I only have a few pre-programmed answers, try saying 'hi', 'hello', 'how are you' or 'bye'!";
}

module.exports = generateRobotReply;
