const connection = require("./db.js");
let values = require("../values");
let {encrypt, decrypt, sendEmail} = require("../values");

exports.login = (email, password, req, res) => {
  connection.query('SELECT * FROM user WHERE email = ? AND password = ?',[email, values.encrypt(password)],function(error,results,fields){
    if (results.length > 0) {
      console.log('logged in');
      values.setIsIncorrectPassword(false);
      values.setLoggedIn(true);
      values.setCurrentUserID(results[0].user_id);
      res.redirect('/index.html');
    } else {
      console.log('failed to log in');
      values.setIsIncorrectPassword(true);
      res.redirect('/login.html');
    }
  })
};

exports.getAddress = (id, res) => {
  const query = 'SELECT * FROM address WHERE address_id = ?';
  connection.query(query,[id],function(error,results,fields) {
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.json({status: false});
    }
  })
};