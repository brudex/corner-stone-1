const Controller = {};
module.exports = Controller;


Controller.index = (req,res) => {
  res.render('index', { title: 'Express' });
};

Controller.login = (req,res) => {
  res.render('index', { title: 'Express' });
};




module.exports = Controller;
