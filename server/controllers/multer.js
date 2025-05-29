// Multer middleware to make it possible to attach files

const multer = require('multer');

const storage = multer.memoryStorage(); // Store file in RAM buffer

const upload = multer({ storage });

module.exports = upload;
