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

exports.getCart = (res) => {
  let returnable = values.getCart();
  returnable.forEach((element) => {
    connection.query('SELECT * FROM showTime WHERE show_id = ?',[element.show_id],function(error,results,fields) {
        if (results.length > 0) {
            let movieId = results[0].movie_id;
            connection.query('SELECT * FROM movie WHERE movie_id = ?',[movieId],function(error,results,fields) {
                element.title = results[0].title;
                element.img = results[0].img;
            });
            element.date = results[0].date;
            element.time = results[0].time;
            connection.query('SELECT * FROM ENUM_ticketType WHERE tickettype_id = ?',[element.ticketType],function(error,results,fields) {
                element.price = results[0].price;
                element.ticketTypeName = results[0].tickettyoe_name;
            });
        } else {
            res.json({status: false});
        }
    });
  })
  res.json({returnable});
};
