const connection = require("./db.js");
let values = require("../values");
let {encrypt, decrypt, sendEmail} = require("../values");

exports.editMovie = (input, res) => {
    if (input.title != '') {
        let title = input.title;
        const query = 'UPDATE movie SET title = ? WHERE movie_id = ?';
        connection.query(query,[title, values.getMovieId()],function(error,results,fields) {
            console.log('title updated');
        });
    }
    if (input.rating != '') {
        let rating;
        if (input.rating == 'PG') rating = 2;
        else if (input.rating == 'PG-13') rating = 1;
        else if (input.rating == 'R') rating = 3;
        const query = 'UPDATE movie SET ratings_id = ? WHERE movie_id = ?';
        connection.query(query,[rating, values.getMovieId()],function(error,results,fields) {
            console.log('rating updated');
        });
    }
    if (input.genre != '') {
        let genre = input.genre;
        const query = 'UPDATE movie SET genre = ? WHERE movie_id = ?';
        connection.query(query,[genre, values.getMovieId()],function(error,results,fields) {
            console.log('genre updated');
        });
    }
    if (input.releaseDate != '') {
        let releaseDate = input.releaseDate;
        const query = 'UPDATE movie SET release_date = ? WHERE movie_id = ?';
        connection.query(query,[releaseDate, values.getMovieId()],function(error,results,fields) {
            console.log('releaseDate updated');
        });
    }
    if (input.duration != '') {
        let duration = input.duration;
        const query = 'UPDATE movie SET duration = ? WHERE movie_id = ?';
        connection.query(query,[duration, values.getMovieId()],function(error,results,fields) {
            console.log('duration updated');
        });
    }
    if (input.cast != '') {
        let cast = input.cast;
        const query = 'UPDATE movie SET cast = ? WHERE movie_id = ?';
        connection.query(query,[cast, values.getMovieId()],function(error,results,fields) {
            console.log('cast updated');
        });
    }
    if (input.description != '') {
        let description = input.description;
        const query = 'UPDATE movie SET description = ? WHERE movie_id = ?';
        connection.query(query,[description, values.getMovieId()],function(error,results,fields) {
            console.log('description updated');
        });
    }
};

exports.getAllMovies = (res) => {
    const query = 'SELECT * FROM movie';
    connection.query(query,[],function(error,results,fields) {
        results.forEach(result => {
            result.image = "<img class='img-movie-poster' src='" + result.img + "'/>";
        }) // set image
      res.json(results);
    });
};

exports.getUpcomingMovies = (tomorrow, res) => {
    const query = 'SELECT * FROM movie WHERE release_date BETWEEN ? AND "9999-99-99" ORDER BY release_date DESC LIMIT 4;'; 
    connection.query(query,[tomorrow],function(error,results,fields) {
        results.forEach(result => {
            result.button = '<form action="/book" method="POST"><input style="display: none" type="text" id="movie_id" name="movie_id" value=' + result.movie_id + '><input class="button-book-now" type="submit" value="Book Tickets"></form>'
            result.image = "<img class='img-movie-poster' src='" + result.img + "'/>";
        }) // set image
        res.json(results);
    });
};
  
exports.getNewestReleases = (today, res) => {
    const query = 'SELECT * FROM movie WHERE release_date BETWEEN "0000-00-00" AND ? ORDER BY release_date DESC LIMIT 4;';
    connection.query(query,[today],function(error,results,fields) {
        results.forEach(result => {
            result.button = '<form action="/book" method="POST"><input style="display: none" type="text" id="movie_id" name="movie_id" value=' + result.movie_id + '><input class="button-book-now" type="submit" value="Book Tickets"></form>'
            result.image = "<img class='img-movie-poster' src='" + result.img + "'/>";
        }) // set image
        res.json(results);
    });
};

  
exports.searchMovie = (isTitle, isGenre, isRating, req, res) => {
    if (isTitle && isGenre && isRating) {
        let rating;
        if (req.body.rating == 'PG') rating = 2;
        else if (req.body.rating == 'PG-13') rating = 1;
        else if (req.body.rating == 'R') rating = 3;
        let query = 'SELECT * FROM movie WHERE title = ? and genre = ? and ratings_id = ?';
        connection.query(query,[req.body.title, req.body.genre, rating],function(error,results,fields) {
            if (results.length > 0) {
                results.forEach(result => {
                    result.button = '<form action="/book" method="POST"><input style="display: none" type="text" id="movie_id" name="movie_id" value=' + result.movie_id + '><input class="button-book-now" type="submit" value="Book Tickets"></form>'
                    result.image = "<img class='img-movie-poster' src='" + result.img + "'/>";
                }) // set image
                res.json(results);
            } else {
                res.json({status: false});
            }
        });
    } else if (isTitle && isGenre) {
        let query = 'SELECT * FROM movie WHERE title = ? and genre = ?';
        connection.query(query,[req.body.title, req.body.genre],function(error,results,fields) {
            if (results.length > 0) {
                results.forEach(result => {
                    result.button = '<form action="/book" method="POST"><input style="display: none" type="text" id="movie_id" name="movie_id" value=' + result.movie_id + '><input class="button-book-now" type="submit" value="Book Tickets"></form>'
                    result.image = "<img class='img-movie-poster' src='" + result.img + "'/>";
                }) // set image
                res.json(results);
            } else {
                res.json({status: false});
            }
        });
    } else if (isTitle && isRating) {
        let rating;
        if (req.body.rating == 'PG') rating = 2;
        else if (req.body.rating == 'PG-13') rating = 1;
        else if (req.body.rating == 'R') rating = 3;
        let query = 'SELECT * FROM movie WHERE title = ? and ratings_id = ?';
        connection.query(query,[req.body.title, rating],function(error,results,fields) {
            if (results.length > 0) {
                results.forEach(result => {
                    result.button = '<form action="/book" method="POST"><input style="display: none" type="text" id="movie_id" name="movie_id" value=' + result.movie_id + '><input class="button-book-now" type="submit" value="Book Tickets"></form>'
                    result.image = "<img class='img-movie-poster' src='" + result.img + "'/>";
                }) // set image
                res.json(results);
            } else {
                res.json({status: false});
            }
        });
    } else if (isGenre && isRating) {
        let rating;
        if (req.body.rating == 'PG') rating = 2;
        else if (req.body.rating == 'PG-13') rating = 1;
        else if (req.body.rating == 'R') rating = 3;
        let query = 'SELECT * FROM movie WHERE genre = ? and ratings_id = ?';
        connection.query(query,[req.body.genre, rating],function(error,results,fields) {
            if (results.length > 0) {
                results.forEach(result => {
                    result.button = '<form action="/book" method="POST"><input style="display: none" type="text" id="movie_id" name="movie_id" value=' + result.movie_id + '><input class="button-book-now" type="submit" value="Book Tickets"></form>'
                    result.image = "<img class='img-movie-poster' src='" + result.img + "'/>";
                }) // set image
                res.json(results);
            } else {
                res.json({status: false});
            }
        });
    } else if (isTitle) {
        let query = 'SELECT * FROM movie WHERE title = ?';
        connection.query(query,[req.body.title],function(error,results,fields) {
            if (results.length > 0) {
                results.forEach(result => {
                    result.button = '<form action="/book" method="POST"><input style="display: none" type="text" id="movie_id" name="movie_id" value=' + result.movie_id + '><input class="button-book-now" type="submit" value="Book Tickets"></form>'
                    result.image = "<img class='img-movie-poster' src='" + result.img + "'/>";
                }) // set image
                res.json(results);
            } else {
                res.json({status: false});
            }
        });
    } else if (isGenre) {
        let query = 'SELECT * FROM movie WHERE genre = ?';
        connection.query(query,[req.body.genre],function(error,results,fields) {
            if (results.length > 0) {
                results.forEach(result => {
                    result.button = '<form action="/book" method="POST"><input style="display: none" type="text" id="movie_id" name="movie_id" value=' + result.movie_id + '><input class="button-book-now" type="submit" value="Book Tickets"></form>'
                    result.image = "<img class='img-movie-poster' src='" + result.img + "'/>";
                }) // set image
                res.json(results);
            } else {
                res.json({status: false});
            }
        });
    } else if (isRating) {
        let rating;
        if (req.body.rating == 'PG') rating = 2;
        else if (req.body.rating == 'PG-13') rating = 1;
        else if (req.body.rating == 'R') rating = 3;
        let query = 'SELECT * FROM movie WHERE ratings_id = ?';
        connection.query(query,[rating],function(error,results,fields) {
            if (results.length > 0) {
                results.forEach(result => {
                    result.button = '<form action="/book" method="POST"><input style="display: none" type="text" id="movie_id" name="movie_id" value=' + result.movie_id + '><input class="button-book-now" type="submit" value="Book Tickets"></form>'
                    result.image = "<img class='img-movie-poster' src='" + result.img + "'/>";
                }) // set image
                res.json(results);
            } else {
                res.json({status: false});
            }
        });
    } else {
        res.json({status: false});
    }
};

exports.getMovie = (res) => {
    const query = 'SELECT * FROM movie WHERE movie_id = ?';
    console.log(values.getMovieId());
    connection.query(query,[values.getMovieId()],function(error,results,fields) {
      if (results.length > 0) {
        console.log(console.log(results[0]));
          res.json(results[0]);
      } else {
          res.json({status: false});
      }
    });
};
  
exports.addMovie = (req, res) => {
    let title = req.body.title;
    let rating;
    if (req.body.rating == 'PG') rating = 2;
    else if (req.body.rating == 'PG-13') rating = 1;
    else if (req.body.rating == 'R') rating = 3;
    let genre = req.body.genre;
    let releaseDate = req.body.releaseDate;
    let duration = req.body.duration;
    let director = req.body.director;
    let producer = req.body.producer;
    let cast = req.body.cast;
    let description = req.body.description;
    let audienceRating = req.body.audienceRating;
    let img = req.body.img;
    let videoURL = req.body.videoURL;

    const query = 'INSERT INTO movie (title, ratings_id, genre, release_date, duration, director, producer, cast, description, audience_rating, img, video_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
    connection.query(query,[title, rating, genre, releaseDate, duration, director, producer, cast, description, audienceRating, img, videoURL],function(error,results,fields) {
        console.log('movie added');
    });
};

exports.editMovie = (input, res) => {
    if (input.title != '') {
        let title = input.title;
        const query = 'UPDATE movie SET title = ? WHERE movie_id = ?';
        connection.query(query,[title, values.getMovieId()],function(error,results,fields) {
            console.log('title updated');
        });
    }
    if (input.rating != '') {
        let rating;
        if (input.rating == 'PG') rating = 2;
        else if (input.rating == 'PG-13') rating = 1;
        else if (input.rating == 'R') rating = 3;
        const query = 'UPDATE movie SET ratings_id = ? WHERE movie_id = ?';
        connection.query(query,[rating, values.getMovieId()],function(error,results,fields) {
            console.log('rating updated');
        });
    }
    if (input.genre != '') {
        let genre = input.genre;
        const query = 'UPDATE movie SET genre = ? WHERE movie_id = ?';
        connection.query(query,[genre, values.getMovieId()],function(error,results,fields) {
            console.log('genre updated');
        });
    }
    if (input.releaseDate != '') {
        let releaseDate = input.releaseDate;
        const query = 'UPDATE movie SET release_date = ? WHERE movie_id = ?';
        connection.query(query,[releaseDate, values.getMovieId()],function(error,results,fields) {
            console.log('releaseDate updated');
        });
    }
    if (input.duration != '') {
        let duration = input.duration;
        const query = 'UPDATE movie SET duration = ? WHERE movie_id = ?';
        connection.query(query,[duration, values.getMovieId()],function(error,results,fields) {
            console.log('duration updated');
        });
    }
    if (input.cast != '') {
        let cast = input.cast;
        const query = 'UPDATE movie SET cast = ? WHERE movie_id = ?';
        connection.query(query,[cast, values.getMovieId()],function(error,results,fields) {
            console.log('cast updated');
        });
    }
    if (input.description != '') {
        let description = input.description;
        const query = 'UPDATE movie SET description = ? WHERE movie_id = ?';
        connection.query(query,[description, values.getMovieId()],function(error,results,fields) {
            console.log('description updated');
        });
    }
};