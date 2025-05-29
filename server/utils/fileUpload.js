// Converts data to Uri

const DataUriParser = require("datauri/parser");
const path = require("path");
const parser = new DataUriParser();

function formatBufferToDataUri(file) {
  const ext = path.extname(file.originalname).toString();
  return parser.format(ext, file.buffer);
}

module.exports = formatBufferToDataUri;
