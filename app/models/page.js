const connection = require("./db.js");
let values = require("../values");
let {encrypt, decrypt, sendEmail} = require("../values");

exports.getUserInfo = (res) => {
    const query = 'SELECT * FROM user WHERE user_id = ?';
    connection.query(query,[values.getAdminUserProfileId()],function(error,results,fields) {
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.json({status: false});
        }
    });
};

exports.getAllUsersInfo = (res) => {
    const query = 'SELECT * FROM user';
    connection.query(query,[],function(error,results,fields) {
        if (results.length > 0) {
            res.json(results);
        } else {
            res.json({status: false});
        }
    });
};

exports.userInfo = (res) => {
    const query = 'SELECT * FROM user WHERE user_id = ?';
    connection.query(query,[values.getCurrentUserID()],function(error,results,fields) {
      if (results.length > 0) {
          res.json(results[0]);
      } else {
          res.json({status: false});
      }
    });
  };  

exports.adminManageMovies = (res) => {
    const query = 'SELECT * FROM movie';
    connection.query(query,[],function(error,results,fields) {
        results.forEach(result => {
            result.informationButton = '<form action="/adminEditMovie" method="POST"><input style="display: none" type="text" id="movie_id" name="movie_id" value=' + result.movie_id + '><input class="button-book-admin" type="submit" value="Edit Information"></form>'
            result.showtimesButton = '<form action="/adminEditShowtimes" method="POST"><input style="display: none" type="text" id="movie_id" name="movie_id" value=' + result.movie_id + '><input class="button-book-admin" type="submit" value="Manage Showtimes"></form>'
            result.promotionsButton = '<form action="/adminPromotions" method="POST"><input style="display: none" type="text" id="movie_id" name="movie_id" value=' + result.movie_id + '><input class="button-book-admin" type="submit" value="Manage Promotions"></form>'
            result.image = "<img class='img-movie-poster' src='" + result.img + "'/>";
        }) // set image
        res.json(results);
    });
};