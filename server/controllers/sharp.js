// Middleware to accept images max 640x480

const sharp = require("sharp");

const validateImageResolution = (req, res, next) => {
  if (!req.file) return next(); // nothing uploaded

  const filePath = path.join("assets", req.file.filename);

  sharp(filePath)
    .metadata()
    .then((metadata) => {
      if (metadata.width > 640 || metadata.height > 480) {
        fs.unlinkSync(filePath); // delete the file
        return res.status(400).json({ error: "Image resolution must be 640x480 or less." });
      }
      next();
    })
    .catch((err) => {
      fs.unlinkSync(filePath); // delete file on error
      return res.status(400).json({ error: "Invalid image file." });
    });
};

module.exports = { validateImageResolution };