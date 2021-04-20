const path = require("path");

module.exports = function (req, file, cb) {
  const allowedTypes = /jpeg|jpg|png/;

  const extnameIsALlowed = allowedTypes.test(
    path.extname(file.originalname).toLocaleLowerCase()
  );
  const mimetypeIsAllowed = allowedTypes.test(file.mimetype);

  return extnameIsALlowed && mimetypeIsAllowed
    ? cb(null, true)
    : cb("file type not supported");
};
