
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(
      null,
      path.join(__dirname, "../../recordings")
    );
  },

  filename: (req, file, cb) => {
    const extension = path.extname(
      file.originalname
    );

    const uniqueName =
      `${Date.now()}-recording${extension}`;

    cb(null, uniqueName);
  },
});

const allowedMimeTypes = [
  "audio/webm",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/mpeg",
  "audio/mp3",
  "audio/ogg",
  "audio/mp4",
  "audio/aac",
];

const upload = multer({
  storage,

  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 1,
  },

  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only audio files are allowed."
        )
      );
    }
  },
});

module.exports = upload;
