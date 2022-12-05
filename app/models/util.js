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

exports.getAllPromotions = (req, res) => {
  queryPromise1 = (send) =>{
    return new Promise((resolve, reject)=>{
        const promotionsQuery = 'SELECT * FROM promotions WHERE sent = ?';
        connection.query(promotionsQuery,[send],(error, results, fields)=>{
            if(error){
                return reject(error);
            }
          
            return resolve(results);
        });
    });
  };
  queryPromise2 = (movie_id) =>{
      return new Promise((resolve, reject)=>{
          const movieQuery = 'SELECT * FROM movie WHERE movie_id = ?';
          connection.query(movieQuery,[movie_id],(error, results)=>{
              if(error){
                  return reject(error);
              }
              return resolve(results);
          });
      });
  };

  async function runQueries () {
      try {
          let sent = 1;
          let promoResults = await queryPromise1(sent);
          for(let index = 0; index < promoResults.length; index++) {
              result = await queryPromise2(promoResults[index].movie_id)
              promoResults[index] = result[index];
              // GET IMAGE SOURCE FROM MOVIE QUERY (index for promo because their are multiple; Zeros for movie because on every loop result will always be at index 0)
              promoResults[index].image = "<img class='img-movie-poster' src='" + result[0].img + "'/>";

              // ADDS PLACEHOLDER VALUES FOR EDIT PROMOTIONS
              promoResults[index].editButton = '<form action="/adminEditPromotion" method="POST"><input style="display: none" type="text" id="promo_id" name="promo_id" value=' + promoResults[index].promo_id + '><input class="button-book-admin" type="submit" value="Edit Promotion"></form>'
              promoResults[index].removeButton = '<form action="/removePromotion" method="POST"><input style="display: none" type="text" id="promo_id" name="promo_id" value=' + promoResults[index].promo_id + '><input class="button-book-admin" type="submit" value="Remove Promotion"></form>'
          }

          res.json(promoResults);
      } catch(error){
          console.log(error)
      }
  }
  runQueries();
}