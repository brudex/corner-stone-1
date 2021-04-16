const Controller = {};
module.exports = Controller;


//todo implement
Controller.login = (req,res) => {
  res.render('login', { title: 'Express' });
};


//todo implement
Controller.register = (req,res) => {
  res.render('register', { title: 'Express' });
};




module.exports = Controller;
