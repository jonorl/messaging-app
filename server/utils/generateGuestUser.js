// Helper function to create a generic "guest" user so that people don't have to sign up

const crypto = require('crypto');

function generateGuestCredentials() {
  const suffix = crypto.randomBytes(3).toString('hex'); // 6-char hex string
  const name = `Guest_${suffix}`;
  const email = `guest_${suffix}@messaging.com`;
  const password = crypto.randomBytes(4).toString('hex'); // 8-char password

  return { name, email, password };
}

module.exports = generateGuestCredentials;
