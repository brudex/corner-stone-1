const { Op } = require("sequelize");
module.exports = async (model, req, condition = { id: { [Op.gt]: 0 } }) => {
  let page = 1;
  if (req.query.page) {
    page = Math.abs(parseInt(req.query.page));
    if (req.query.page === "0") page = 1;
  }
  const limit = 10;
  const adjacentPagesRight = parseInt(page) + 3;
  const adjacentPagesLeft = parseInt(page) - 3;
  var adjacentLeft = [];
  var adjacentRight = [];

  const offset = (page - 1) * limit;

  const data = await model.findAll({
    where: condition,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  const total = await model.count({ where: condition });
  const pages = Math.ceil(total / limit);

  for (let i = page; i > adjacentPagesLeft; i--) {
    if (i <= 1 || i === 2) break;
    adjacentLeft.push(i - 1);
  }

  adjacentLeft.sort(function (a, b) {
    return a - b;
  });

  for (let i = page; i < adjacentPagesRight; i++) {
    if (i >= pages || i === pages - 1) {
      break;
    }
    adjacentRight.push(i + 1);
  }

  return {
    data,
    total,
    page,
    pages,
    pathname: req.baseUrl + req.path,
    adjacentLeft,
    adjacentRight,
  };
};
