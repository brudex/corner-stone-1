const multer = require("multer");
const path = require("path");

module.exports.allowImagesOnly = function (req, file, cb) {
  const allowedTypes = /jpeg|jpg|png/;

  const extnameIsALlowed = allowedTypes.test(
    path.extname(file.originalname).toLocaleLowerCase()
  );
  const mimetypeIsAllowed = allowedTypes.test(file.mimetype);

  return extnameIsALlowed && mimetypeIsAllowed
    ? cb(null, true)
    : cb("file type not supported");
};

module.exports.allowAudiosOnly = function (req, file, cb) {
  const allowedTypes = /mp3|ogg|wav|/;

  const ex = path.extname(file.originalname).toLocaleLowerCase();
  const em = file.mimetype;
  const extnameIsALlowed = allowedTypes.test(
    path.extname(file.originalname).toLocaleLowerCase()
  );
  // const mimetypeIsAllowed = allowedTypes.test(file.mimetype);

  return extnameIsALlowed ? cb(null, true) : cb("file type not supported");
};

module.exports.storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});
