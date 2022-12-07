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

exports.purchase = (req, res) => {

  let cart = values.getCart();
  console.log("cart total " + values.getCartTotal())
  console.log("userId " + values.getCurrentUserID())
  console.log("showId " + cart[0].show_id)
  console.log("movieId " + values.getMovieId())

  // 0s are filler values before promotions and getting payment card
  let query = 'INSERT INTO booking (total_price, user_id, paymentCard_id, show_id, movie_id, promo_id) VALUES (1, 1, 3, 4, 5, 6);';

  try {
    connection.query(query, function (err, results) {
      console.log("insert booking");
      if (err) console.error('err from callback: ' + err.stack);
    });
  } catch (e) {
    console.error('err thrown: ' + err.stack);
  }

   
  

//connection.query('SELECT scope_identity();', function(error,results,fields) {
 // console.log("pk " + results);
//});

  let seatId;
  for (index = 0; index < cart.length; index++) {

    seatId = cart[index].seat_number;
    ticketType = cart[index].ticketType; 
  const query1 = 'UPDATE showseat SET availability = ? WHERE seat_number = ?;';
  connection.query(query1,[0, cart[index].seat_number], function(error,results,fields) {
    //console.log(results);
  });
  }
}
  /*const query2 = 'SELECT * FROM address WHERE address_id = ?';
  connection.query(query2,[id],function(error,results,fields) {

  }); */
  
