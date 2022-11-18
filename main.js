// CMD + K + 1 to collapse level 1
// CMD + K + J to uncollapse level 1

const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
app.use(express.static('.'));
app.use(require('./routes'));

const encoder = bodyParser.urlencoded();

var adminUserProfileId;
var movieId;
var loggedIn = false;
var currentUserID = -1;

var verificationCode;

var registerBody;
var forgotPasswordEmail;

var isIncorrectPassword = false;
var isIncorrectShowtime = false;

var isInvalidMovie = false;
var promoHeader;
var promoBody;
var promoDiscount;
var promoId;

const algorithm = "aes-256-cbc";
const key ="12345678123456781234567812345678";
const iv = "zAvR2NI87bBx746n";

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });  

// connect to database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'NewCES',
});
connection.connect(function(error) {
    if (error) throw error
    else console.log("connected to database")
})

// set up database encryption
function encrypt(message) {
    const encrypter = crypto.createCipheriv(algorithm, key, iv);
    let encryptedMsg = encrypter.update(message, "utf8", "hex");
    encryptedMsg += encrypter.final("hex");
    return encryptedMsg;
}
function decrypt(encryptedMsg) {
    const decrypter = crypto.createDecipheriv(algorithm, key, iv);
    let decryptedMsg = decrypter.update(encryptedMsg, "hex", "utf8");
    decryptedMsg += decrypter.final("utf8");
    console.log(decryptedMsg)
    return decryptedMsg;
}

/* --------- UTIL --------- */

app.post('/login', encoder, function(req,res) {
    let email = req.body.email;
    let password = req.body.password;

    connection.query('SELECT * FROM user WHERE email = ? AND password = ?',[email, encrypt(password)],function(error,results,fields){
        if (results.length > 0) {
            isIncorrectPassword = false;
            console.log('logged in');
            loggedIn = true;
            currentUserID = results[0].user_id;
            res.redirect('/index.html');
        } else {
            isIncorrectPassword = true;
            console.log('failed to log in');
            res.redirect('/login.html');
        }
    })
})

app.post('/forgotPassword', encoder, function(req,res) {
    forgotPasswordEmail = req.body.email;
    verificationCode = Math.floor(100000 + Math.random() * 900000);
    let message = 'Return to the cinema site and enter this code to reset your password: ' + verificationCode;
    sendEmail(forgotPasswordEmail, message);

    res.redirect('/resetPassword.html')
})

app.post('/forgotUpdatePassword', encoder, function(req,res) {
    let newPassword = req.body.newPassword;
    let confirmNewPassword = req.body.confirmNewPassword;

    if (req.body.regCode != verificationCode) {
        console.log('wrong code');
    }
    else {
        if (newPassword != confirmNewPassword) {
            console.log('passwords dont match');
        }
        else {
            connection.query('SELECT * FROM user WHERE email = ?;',[forgotPasswordEmail],function(error,results,fields) {
                let user_id = results[0].user_id;
                connection.query('UPDATE user SET password = ? WHERE user_id = ?',[encrypt(newPassword), user_id],function(error,results,fields) {
                    console.log('password updated');
                    res.redirect('/login.html');
                });
            });
        }
    }
})

app.post('/getAddress', encoder, function(req,res) {
    let address_id = req.body.id;
    const query = 'SELECT * FROM address WHERE address_id = ?';
    connection.query(query,[address_id],function(error,results,fields) {
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.json({status: false});
        }
    });
})

app.get('/getAllMovies', encoder, function(req,res) {
    const query = 'SELECT * FROM movie';
    connection.query(query,[],function(error,results,fields) {
        results.forEach(result => {
            result.image = "<img class='img-movie-poster' src='" + result.img + "'/>";
        }) // set image
        res.json(results);
    });
})

app.get('/getAllPromotions', encoder, function(req,res) {
    
    const promotionsQuery = 'SELECT * FROM promotions WHERE sent = ?';
    const movieQuery = 'SELECT * FROM movie WHERE title = ?';

    
    queryPromise1 = (send) =>{
        return new Promise((resolve, reject)=>{
            connection.query(promotionsQuery,[send],(error, results, fields)=>{
                if(error){
                    return reject(error);
                }
               
                return resolve(results);
            });
        });
    };
    queryPromise2 = (title) =>{
        return new Promise((resolve, reject)=>{
            connection.query(movieQuery,[title],(error, results)=>{
                if(error){
                    return reject(error);
                }
                return resolve(results);
            });
        });
    };

    async function runQueries () {
        
        try{
        let sent = 0;
     promoResults = await queryPromise1(sent);
     console.log(promoResults);

     for(let index = 0; index < promoResults.length; index++) {
    console.log(promoResults[index].title)
     result = await queryPromise2(promoResults[index].title)
console.log(result)

        // GET IMAGE SOURCE FROM MOVIE QUERY (index for promo because their are multiple; Zeros for movie because on every loop result will always be at index 0)
     promoResults[index].image = "<img class='img-movie-poster' src='" + result[0].img + "'/>";


 // ADDS PLACEHOLDER VALUES FOR EDIT PROMOTIONS
    
 promoResults[index].editButton = '<form action="/adminEditPromotion" method="POST"><input style="display: none" type="text" id="promo_id" name="promo_id" value=' + promoResults[index].promo_id + '><input class="button-book-admin" type="submit" value="Edit Promotion"></form>'
 promoResults[index].removeButton = '<form action="/removePromotion" method="POST"><input style="display: none" type="text" id="promo_id" name="promo_id" value=' + promoResults[index].promo_id + '><input class="button-book-admin" type="submit" value="Remove Promotion"></form>'
   
  
     }
 
        res.json(promoResults);
      
        console.log(promoResults);
         
        } catch(error){
        console.log(error)
        }
    }
runQueries();
})

app.get('/getUpcomingMovies', encoder, function(req,res) {
    let tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    let tomorrow = tomorrowDate.toISOString().slice(0, 10);
    console.log("today: " + tomorrow);
    const query = 'SELECT * FROM movie WHERE release_date BETWEEN ? AND "9999-99-99" ORDER BY release_date DESC LIMIT 4;'; 
    connection.query(query,[tomorrow],function(error,results,fields) {
        results.forEach(result => {
            result.button = '<form action="/book" method="POST"><input style="display: none" type="text" id="movie_id" name="movie_id" value=' + result.movie_id + '><input class="button-book-now" type="submit" value="Book Tickets"></form>'
            result.image = "<img class='img-movie-poster' src='" + result.img + "'/>";
        }) // set image
        res.json(results);
    });
})

app.get('/getNewestReleases', encoder, function(req,res) {
    let today = new Date().toISOString().slice(0, 10);
    const query = 'SELECT * FROM movie WHERE release_date BETWEEN "0000-00-00" AND ? ORDER BY release_date DESC LIMIT 4;'; 
    connection.query(query,[today],function(error,results,fields) {
        results.forEach(result => {
            result.button = '<form action="/book" method="POST"><input style="display: none" type="text" id="movie_id" name="movie_id" value=' + result.movie_id + '><input class="button-book-now" type="submit" value="Book Tickets"></form>'
            result.image = "<img class='img-movie-poster' src='" + result.img + "'/>";
        }) // set image
        res.json(results);
    });
})

// app.post('/book', encoder, function(req,res) {
//     console.log(req.body.movie_id);
//     movieId = req.body.movie_id;
//     res.redirect('/book.html');
// })

app.post("/searchMovie", encoder, function(req,res) {
    console.log(req.body);
    let isTitle, isGenre, isRating = false;
    if (req.body.title != '') isTitle = true;
    if (req.body.rating != '') isRating = true;
    if (req.body.genre != '') isGenre = true;

    let query;

    if (isTitle && isGenre && isRating) {
        let rating;
        if (req.body.rating == 'PG') rating = 2;
        else if (req.body.rating == 'PG-13') rating = 1;
        else if (req.body.rating == 'R') rating = 3;
        query = 'SELECT * FROM movie WHERE title = ? and genre = ? and ratings_id = ?';
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
        query = 'SELECT * FROM movie WHERE title = ? and genre = ?';
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
        query = 'SELECT * FROM movie WHERE title = ? and ratings_id = ?';
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
        query = 'SELECT * FROM movie WHERE genre = ? and ratings_id = ?';
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
        query = 'SELECT * FROM movie WHERE title = ?';
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
        query = 'SELECT * FROM movie WHERE genre = ?';
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
        query = 'SELECT * FROM movie WHERE ratings_id = ?';
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
})

app.get("/getMovie", function(req,res) {
    const query = 'SELECT * FROM movie WHERE movie_id = ?';
    connection.query(query,[movieId],function(error,results,fields) {
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.json({status: false});
        }
    });
})

app.get("/userInfo", function(req,res) {
    if (currentUserID != -1) { // if non-null
        const query = 'SELECT * FROM user WHERE user_id = ?';
        connection.query(query,[currentUserID],function(error,results,fields) {
            if (results.length > 0) {
                res.json(results[0]);
            } else {
                res.json({status: false});
            }
        });
    }
})

app.get('/isLoggedIn', function(req,res) {
    if (loggedIn) res.json({status: true});
    else res.json({status: false});
})

app.get('/logout', function(req,res) {
    console.log('logged out')
    loggedIn = false;
    currentUserID = -1;
    res.redirect('/login.html');
})

function sendEmail(email, message) {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'flixuga@gmail.com',
        pass: 'ynnjdiferwibooty'
      }
    });
    
    let mailOptions = {
      from: 'flixuga@gmail.com',
      to: email,
      subject: 'Cinema Site Automated Message',
      text: message
    };
    
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

app.get("/getPromo", function(req, res) {
    const query = 'SELECT * FROM promotions WHERE promo_id = ?';
    connection.query(query,[promoId],function(error,results,fields) {
        if (results.length > 0) {
            res.json(results[0]);
           // console.log("get promo");
        } else {
            res.json({status: false});
        }
        
    })
});

app.get("/isInvalidMovie", function(req,res) {
    if (!isInvalidMovie) {
        res.json({status: false});
       // console.log("default movie");
    } else { 
        res.json({status: true});
console.log("no movie found");
    }
    //isValidMovie = false;
})

app.get("/isIncorrectPassword", function(req,res) {
    if (isIncorrectPassword) res.json({status: true});
    else res.json({status: false});

    isIncorrectPassword = false;
})

app.get("/isIncorrectShowtime", function(req,res) {
    if (isIncorrectShowtime) res.json({status: true});
    else res.json({status: false});
})

app.get('/getAllShowtimes', encoder, function(req,res) {
    const query = 'SELECT * FROM showTime WHERE movie_id = ?';
    connection.query(query,[movieId],function(error,results,fields) {
        if (results.length > 0) {
            res.json(results);
        } else {
            res.json({status: false});
        }
    });
})

/* --------- ADMIN --------- */

app.get('/adminManageMovies', encoder, function(req,res) {
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
})

app.post('/addShowtime', encoder, function(req,res) {
    connection.query('select * from showTime where date = ? and time = ?;',[req.body.date, req.body.showtime],function(error,results,fields) {
        if (results[0] == null) {
            const query = 'INSERT INTO showTime (movie_id, room_id, date, time) VALUES (?, ?, ?, ?);';
            connection.query(query,[movieId, 1, req.body.date, req.body.showtime],function(error,results,fields) {
                console.log('showtime added');
            });
            isIncorrectShowtime = false;
        } else {
            isIncorrectShowtime = true;
        }
    });

    res.redirect('/adminEditShowtimes.html');
})

app.post('/editShowtime', encoder, function(req,res) {
    if (req.body.date != '') {
        const query = 'UPDATE showTime SET date = ? WHERE show_id = ?';
        connection.query(query,[req.body.date, req.body.id],function(error,results,fields) {
            console.log('date updated');
        });
    }
    if (req.body.time != '') {
        const query = 'UPDATE showTime SET time = ? WHERE show_id = ?';
        connection.query(query,[req.body.time, req.body.id],function(error,results,fields) {
            console.log('date updated');
        });
    }
    res.redirect('/adminEditShowtimes.html');
})

app.post('/addMovie', encoder, function(req,res) {
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
        console.log(error);
        console.log(results);
        console.log(fields);
        console.log('movie added');
    });
    res.redirect('/adminMain.html');
})

app.post('/adminEditMovie', encoder, function(req,res) {
    movieId = req.body.movie_id;
    res.redirect('/adminEditMovie.html');
})

app.post('/editMovie', encoder, function(req,res) {
    if (req.body.title != '') {
        let title = req.body.title;
        const query = 'UPDATE movie SET title = ? WHERE movie_id = ?';
        connection.query(query,[title, movieId],function(error,results,fields) {
            console.log('title updated');
        });
    }
    if (req.body.rating != '') {
        let rating;
        if (req.body.rating == 'PG') rating = 2;
        else if (req.body.rating == 'PG-13') rating = 1;
        else if (req.body.rating == 'R') rating = 3;
        const query = 'UPDATE movie SET ratings_id = ? WHERE movie_id = ?';
        connection.query(query,[rating, movieId],function(error,results,fields) {
            console.log('rating updated');
        });
    }
    if (req.body.genre != '') {
        let genre = req.body.genre;
        const query = 'UPDATE movie SET genre = ? WHERE movie_id = ?';
        connection.query(query,[genre, movieId],function(error,results,fields) {
            console.log('genre updated');
        });
    }
    if (req.body.releaseDate != '') {
        let releaseDate = req.body.releaseDate;
        const query = 'UPDATE movie SET release_date = ? WHERE movie_id = ?';
        connection.query(query,[releaseDate, movieId],function(error,results,fields) {
            console.log('releaseDate updated');
        });
    }
    if (req.body.duration != '') {
        let duration = req.body.duration;
        const query = 'UPDATE movie SET duration = ? WHERE movie_id = ?';
        connection.query(query,[duration, movieId],function(error,results,fields) {
            console.log('duration updated');
        });
    }
    if (req.body.cast != '') {
        let cast = req.body.cast;
        const query = 'UPDATE movie SET cast = ? WHERE movie_id = ?';
        connection.query(query,[cast, movieId],function(error,results,fields) {
            console.log('cast updated');
        });
    }
    if (req.body.description != '') {
        let description = req.body.description;
        const query = 'UPDATE movie SET description = ? WHERE movie_id = ?';
        connection.query(query,[description, movieId],function(error,results,fields) {
            console.log('description updated');
        });
    }
    res.redirect('/adminEditMovie.html');
})

app.post('/adminEditShowtimes', encoder, function(req,res) {
    movieId = req.body.movie_id;
    res.redirect('/adminEditShowtimes.html');
})

app.post('/adminEditMovie', encoder, function(req,res) {
    movieId = req.body.movie_id;
    res.redirect('/adminEditMovie.html');
})

app.post('/adminPromotions', encoder, function(req,res) {
    movieId = req.body.movie_id;
    res.redirect('/adminPromotions.html');
})

app.post('/addPromotion', encoder, function(req,res) {
    promoBody = req.body.message;
    promoHeader = req.body.heading;
    let promoDiscount = req.body.percent;
    let promocode = req.body.promocode;
    let startdate = req.body.startdate;
    let enddate = req.body.enddate;
     
    let sent = 0;
         
    connection.query('INSERT INTO promotions (start_date, end_date, promo_code, movie_id, discount, sent, message) VALUES (?, ?, ?, ?, ?, ?, ?);',[startdate, enddate, promocode, movieId, promoDiscount, sent, promoBody],function(error,results,fields) {
        console.log(results);
        console.log(error);
        console.log(fields);
        console.log("insert to promotions");
    });

    connection.query('SELECT * FROM promotions WHERE start_date = ? and end_date = ? and promo_code = ? and movie_id = ? and discount = ? and sent = ? and message = ?;',[startdate, enddate, promocode, movieId, promoDiscount, sent, promoBody],function(error,results,fields) {
        promoId = results[0].promo_id;
    });
    res.redirect('/adminSendPromo.html');
 });

app.post('/sendPromotion', encoder, function(req,res) {
   
    let promotion = 'Y';
   // console.log(message);
    connection.query('SELECT * FROM user WHERE promo_subs = ?',[promotion],function(error,results,fields) {
        console.log(results);

        // SEND EMAILS
        for(let index = 0; index < results.length; index++) {
            let email = results[index].email;
            sendEmail(email, promoBody, promoHeader);
        }

        // UPDATE PROMO DATABASE (SENT)
        let sent = 1;
        connection.query('UPDATE promotions SET sent = ? WHERE promo_id = ?',[sent, promoId],function(error,results,fields) {
        console.log("updated promo database")
        });

        console.log("promotion sent");
        res.redirect('/adminMain.html');
    });
});

app.post('/removePromotion', function(req,res) {
    connection.query('DELETE from promotions WHERE promo_id = ?',[promoId],function(error,results,fields) {
        console.log("promo removed");
    }) 
    res.redirect('/adminPromotions.html');
})

app.post('/adminEditPromotion', encoder, function(req,res) {
    promoId = req.body.promo_id;
    res.redirect('/adminEditPromotion.html');
    console.log("edit promo is " + req.body.id);
              
 });

app.post('/adminUpdatePromotion', encoder, function(req,res) {
    let promotions;
    if (req.body.promotions == 'on') promotions = 'Y'
    else promotions = 'N'
    const query = 'UPDATE user SET promo_subs = ? WHERE user_id = ?';
    connection.query(query,[promotions, adminUserProfileId],function(error,results,fields) {
        console.log('promotion updated');
        connection.query('SELECT * FROM user WHERE user_id = ?;',[adminUserProfileId],function(error,results,fields) {
            let email = results[0].email;
            let message = 'Your account promotion settings have been updated!'
            sendEmail(email, message);
        });
    });
    res.redirect('/adminEditUserProfile.html');
})

app.post('/updatePromotion', encoder, function(req,res) {
    let promotions;
    if (req.body.promotions == 'on') promotions = 'Y'
    else promotions = 'N'
    const query = 'UPDATE user SET promo_subs = ? WHERE user_id = ?';
    connection.query(query,[promotions, currentUserID],function(error,results,fields) {
        console.log('promotion updated');
        connection.query('SELECT * FROM user WHERE user_id = ?;',[currentUserID],function(error,results,fields) {
            let email = results[0].email;
            let message = 'Your account promotion settings have been updated!'
            sendEmail(email, message);
        });
    });
    res.redirect('/editProfile.html');
})

app.get('/getAllUsers', encoder, function(req,res) {
    const query = 'SELECT * FROM user';
    connection.query(query,[],function(error,results,fields) {
        res.json(results);
    });
})

app.post('/adminEditUserProfile', encoder, function(req,res) {
    adminUserProfileId = req.body.user_id;
    res.redirect('/adminEditUserProfile.html');
})

app.get("/adminGetUserInfo", function(req,res) {
    const query = 'SELECT * FROM user WHERE user_id = ?';
    connection.query(query,[adminUserProfileId],function(error,results,fields) {
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.json({status: false});
        }
    });
})

app.post('/adminUpdateName', encoder, function(req,res) {
    let firstName = req.body.fname;
    let lastName = req.body.lname;
    const query = 'UPDATE user SET first_name = ?, last_name = ? WHERE user_id = ?';
    connection.query(query,[firstName, lastName, adminUserProfileId],function(error,results,fields) {
        console.log('name updated');
        connection.query('SELECT * FROM user WHERE user_id = ?;',[adminUserProfileId],function(error,results,fields) {
            let email = results[0].email;
            let message = 'Your account name has been updated!'
            sendEmail(email, message);
        });
    });
    res.redirect('/adminEditUserProfile.html');
})

app.post('/adminUpdatePhone', encoder, function(req,res) {
    let phone = req.body.phone;
    const query = 'UPDATE user SET phone_num = ? WHERE user_id = ?';
    connection.query(query,[phone, adminUserProfileId],function(error,results,fields) {
        console.log('phone updated');
        connection.query('SELECT * FROM user WHERE user_id = ?;',[adminUserProfileId],function(error,results,fields) {
            let email = results[0].email;
            let message = 'Your account phone number has been updated!'
            sendEmail(email, message);
        });
    });
    res.redirect('/adminEditUserProfile.html');
})

app.post('/adminUpdateUserType', encoder, function(req,res) {
    let utype;
    if (req.body.utype == 'on') utype = 1
    else utype = 2
    const query = 'UPDATE user SET utype_id = ? WHERE user_id = ?';
    connection.query(query,[utype, adminUserProfileId],function(error,results,fields) {
        console.log('utype updated');
        connection.query('SELECT * FROM user WHERE user_id = ?;',[adminUserProfileId],function(error,results,fields) {
            let email = results[0].email;
            let message = 'Your account type has been updated!'
            sendEmail(email, message);
        });
    });
    res.redirect('/adminEditUserProfile.html');
})

app.post('/adminUpdatePromotion', encoder, function(req,res) {
    let promotions;
    if (req.body.promotions == 'on') promotions = 'Y'
    else promotions = 'N'
    const query = 'UPDATE user SET promo_subs = ? WHERE user_id = ?';
    connection.query(query,[promotions, adminUserProfileId],function(error,results,fields) {
        console.log('promotion updated');
        connection.query('SELECT * FROM user WHERE user_id = ?;',[adminUserProfileId],function(error,results,fields) {
            let email = results[0].email;
            let message = 'Your account promotion settings have been updated!'
            sendEmail(email, message);
        });
    });
    res.redirect('/adminEditUserProfile.html');
})

app.post('/adminUpdatePassword', encoder, function(req,res) {
    let newPassword = req.body.newPassword;
    let confirmNewPassword = req.body.confirmNewPassword;

    if (newPassword != confirmNewPassword) {
        console.log('passwords dont match');
    }
    else {
        connection.query('UPDATE user SET password = ? WHERE user_id = ?',[encrypt(newPassword), adminUserProfileId],function(error,results,fields) {
            console.log('password updated');
            connection.query('SELECT * FROM user WHERE user_id = ?;',[adminUserProfileId],function(error,results,fields) {
                let email = results[0].email;
                let message = 'Your account password has been updated!'
                sendEmail(email, message);
            });
        });
        res.redirect('/adminEditUserProfile.html');
    }
})

app.post('/adminUpdateHomeAddress', encoder, function(req,res) {
    let street = req.body.street;
    let city = req.body.city;
    let state = req.body.state;
    let zip = req.body.zip;

    connection.query('SELECT * FROM user WHERE user_id = ?',[adminUserProfileId],function(error,results,fields) {
        let homeAddressId = results[0].home_address_id;
        if (homeAddressId != null) {
            const query = 'UPDATE address SET street = ?, city = ?, state = ?, zipcode = ? WHERE address_id = ?'
            connection.query(query,[street, city, state, zip, homeAddressId],function(error,results,fields) {
                console.log('address updated');
                connection.query('SELECT * FROM user WHERE user_id = ?;',[adminUserProfileId],function(error,results,fields) {
                    let email = results[0].email;
                    let message = 'Your account home address has been updated!'
                    sendEmail(email, message);
                });
                res.redirect('/adminEditUserProfile.html');
            });
        }
        else { // EXCEPTION: home address not assigned yet
            connection.query('INSERT INTO address (street, city, state, country, zipcode) VALUES (?, ?, ?, ?, ?);',[street, city, state, 'United States', zip],function(error,results,fields) {
            });
            connection.query('SELECT * FROM address WHERE street = ? AND city = ? AND state = ? AND country = ? AND zipcode = ?;',[street, city, state, 'United States', zip],function(error,results,fields) {
                let address_id = results[0].address_id;
                connection.query('UPDATE user SET home_address_id = ? WHERE user_id = ?;',[address_id, adminUserProfileId],function(error,results,fields) {
                    console.log('created address');
                    connection.query('SELECT * FROM user WHERE user_id = ?;',[adminUserProfileId],function(error,results,fields) {
                        let email = results[0].email;
                        let message = 'Your account home address has been updated!'
                        sendEmail(email, message);
                    });
                    res.redirect('/adminEditUserProfile.html');
                });
            });
        }
    });
})

/* --------- USER --------- */

app.post('/register', encoder, function(req,res) {
    registerBody = req.body;
    if (req.body.email != req.body.confemail) {
        console.log('emails do not match');
    }
    else if (req.body.password != req.body.confpassword) {
        console.log('passwords do not match');
    }
    else {
        verificationCode = Math.floor(100000 + Math.random() * 900000);
        let message = 'Thanks for creating an account! To verify your account, use this code: ' + verificationCode
        sendEmail(req.body.email, message);

        console.log('verification code:' + verificationCode);

        res.redirect('/registerVerification.html');    
    }
})

app.post('/verify', encoder, function(req,res) {
    if (req.body.regCode != verificationCode) {
        console.log('wrong code');
    }
    else {
        console.log('verified');
        let firstName = registerBody.fname;
        let lastName = registerBody.lname;
        let phone = registerBody.phone;
        let email = registerBody.email;
        let password = registerBody.password;
        let promotions;
        if (registerBody.promotions == 'on') promotions = 'Y'
        else promotions = 'N'

        // Optional
        let homeAddressOptional = false;
        if (registerBody.homeStreet != ''
            && registerBody.homeCity != ''
            && registerBody.homeState != ''
            && registerBody.homeZip != '') {
                homeAddressOptional = true;
        }
        let paymentOptional = false;
        if (registerBody.cardType != '' 
            && registerBody.cardNumb != ''
            && registerBody.expDate != ''
            && registerBody.billingStreet != ''
            && registerBody.billingCity != ''
            && registerBody.billingState != ''
            && registerBody.billingZip != '') {
                paymentOptional = true;
        }

        let cardType, cardNumber, cardExpiration;
        let billingStreet, billingCity, billingState, billingZip;
        if (paymentOptional) {
            cardType = registerBody.cardType;
            cardNumber = registerBody.cardNumb;
            cardExpiration = registerBody.expDate;
            billingStreet = registerBody.billingStreet;
            billingCity = registerBody.billingCity;
            billingState = registerBody.billingState;
            billingZip = registerBody.billingZip;
        }

        let homeStreet, homeCity, homeState, homeZip;
        if (homeAddressOptional) {
            homeStreet = registerBody.homeStreet;
            homeCity = registerBody.homeCity;
            homeState = registerBody.homeState;
            homeZip = registerBody.homeZip;
        }

        // create user
        connection.query('INSERT INTO user (first_name, last_name, phone_num, email, password, utype_id, status_id, promo_subs) VALUES (?, ?, ?, ?, ?, 2, 1, ?);',[firstName, lastName, phone, email, encrypt(password), promotions],function(error,results,fields){
            console.log('created user');
            let message = 'Your Account has been successfully created! Thank you for choosing UGA Flix!'
            sendEmail(email, message);
        });

        // create & add address to user
        if (homeAddressOptional) {
            connection.query('INSERT INTO address (street, city, state, country, zipcode) VALUES (?, ?, ?, ?, ?);',[homeStreet, homeCity, homeState, 'United States', homeZip],function(error,results,fields) {
            });
            connection.query('SELECT * FROM address WHERE street = ? AND city = ? AND state = ? AND country = ? AND zipcode = ?;',[homeStreet, homeCity, homeState, 'United States', homeZip],function(error,results,fields) {
                let address_id = results[0].address_id;
                connection.query('SELECT * FROM user WHERE first_name = ? AND last_name = ? AND phone_num = ? AND email = ? AND password = ?;',[firstName, lastName, phone, email, encrypt(password)],function(error,results,fields) {
                    let user_id = results[0].user_id;
                    connection.query('UPDATE user SET home_address_id = ? WHERE user_id = ?;',[address_id, user_id],function(error,results,fields) {
                        console.log('created home address');
                    });
                });
            });
        }

        // create & add payment to user
        if (paymentOptional) {
            const cardExpirationArray = cardExpiration.split('');
            connection.query('INSERT INTO address (street, city, state, country, zipcode) VALUES (?, ?, ?, ?, ?);',[billingStreet, billingCity, billingState, 'United States', billingZip],function(error,results,fields) {
            });
            connection.query('SELECT * FROM address WHERE street = ? AND city = ? AND state = ? AND country = ? AND zipcode = ?;',[billingStreet, billingCity, billingState, 'United States', billingZip],function(error,results,fields) {
                let address_id = results[0].address_id;
                connection.query('SELECT * FROM user WHERE first_name = ? AND last_name = ? AND phone_num = ? AND email = ? AND password = ?;',[firstName, lastName, phone, email, encrypt(password)],function(error,results,fields) {
                    let user_id = results[0].user_id;
                    connection.query('INSERT INTO paymentCard (card_num, type, expiration_month, expiration_year, user_id, address_id) VALUES (?, ?, ?, ?, ?, ?);',[encrypt(cardNumber), encrypt(cardType), encrypt(cardExpirationArray[0] + cardExpirationArray[1]), encrypt(cardExpirationArray[3] + cardExpirationArray[4] + cardExpirationArray[5] + cardExpirationArray[6]), user_id, address_id],function(error,results,fields) {
                        console.log('created card');
                    });
                });
            });
        }

        res.redirect('/registerConfirmation.html');
    }
})

app.post('/addCard', encoder, function(req,res) {
    let cardType = req.body.cardType;
    let cardNumber = req.body.cardNumb;
    let cardExpiration = req.body.expDate;
    let billingStreet = req.body.billingStreet;
    let billingCity = req.body.billingCity;
    let billingState = req.body.billingState;
    let billingZip = req.body.billingZip;

    const cardExpirationArray = cardExpiration.split('');

    // create & add payment to user
    connection.query('INSERT INTO address (street, city, state, country, zipcode) VALUES (?, ?, ?, ?, ?);',[billingStreet, billingCity, billingState, 'United States', billingZip],function(error,results,fields) {
        console.log('successfully added address');
    });
    connection.query('SELECT * FROM address WHERE street = ? AND city = ? AND state = ? AND country = ? AND zipcode = ?;',[billingStreet, billingCity, billingState, 'United States', billingZip],function(error,results,fields) {
        let address_id = results[0].address_id;
        connection.query('INSERT INTO paymentCard (card_num, type, expiration_month, expiration_year, user_id, address_id) VALUES (?, ?, ?, ?, ?, ?);',[encrypt(cardNumber), encrypt(cardType), encrypt(cardExpirationArray[0] + cardExpirationArray[1]), encrypt(cardExpirationArray[3] + cardExpirationArray[4] + cardExpirationArray[5] + cardExpirationArray[6]), currentUserID, address_id],function(error,results,fields) {
                console.log('created card');
        });
    });

    res.redirect('/usercards.html');
})

app.get('/getCard', function(req,res) {
    const query = 'SELECT * FROM paymentCard WHERE user_id = ?';
    connection.query(query,[currentUserID],function(error,results,fields) {
        if (results.length > 0) {
            results[0].card_num = decrypt(results[0].card_num);
            results[0].type = decrypt(results[0].type);
            results[0].expiration_month = decrypt(results[0].expiration_month);
            results[0].expiration_year = decrypt(results[0].expiration_year);
            res.json(results[0]);
        } else {
            res.json({status: false});
        }
    });
})

app.post('/deleteCard', encoder, function(req,res) {
    // delete billing address
    connection.query('SELECT * FROM paymentCard WHERE paymentCard_id = ?',[req.body.id],function(error,results,fields) {
        let address_id = results[0].address_id;
        connection.query('DELETE FROM address WHERE address_id = ?',[address_id],function(error,results,fields) {
            console.log('deleted billing address');
        });
    });

    // delete card
    connection.query('DELETE FROM paymentCard WHERE paymentCard_id = ?',[req.body.id],function(error,results,fields) {
        console.log('deleted card');
    });
    res.redirect('/userCards.html');
})

app.post('/updateName', encoder, function(req,res) {
    let firstName = req.body.fname;
    let lastName = req.body.lname;
    const query = 'UPDATE user SET first_name = ?, last_name = ? WHERE user_id = ?';
    connection.query(query,[firstName, lastName, currentUserID],function(error,results,fields) {
        console.log('name updated');
        connection.query('SELECT * FROM user WHERE user_id = ?;',[currentUserID],function(error,results,fields) {
            let email = results[0].email;
            let message = 'Your account name has been updated!'
            sendEmail(email, message);
        });
    });
    res.redirect('/editProfile.html');
})

app.post('/updatePhone', encoder, function(req,res) {
    let phone = req.body.phone;
    const query = 'UPDATE user SET phone_num = ? WHERE user_id = ?';
    connection.query(query,[phone, currentUserID],function(error,results,fields) {
        console.log('phone updated');
        connection.query('SELECT * FROM user WHERE user_id = ?;',[currentUserID],function(error,results,fields) {
            let email = results[0].email;
            let message = 'Your account phone number has been updated!'
            sendEmail(email, message);
        });
    });
    res.redirect('/editProfile.html');
})

app.post('/updatePassword', encoder, function(req,res) {
    let currentPassword = req.body.currentPassword;
    let newPassword = req.body.newPassword;
    let confirmNewPassword = req.body.confirmNewPassword;

    if (newPassword != confirmNewPassword) {
        console.log('passwords dont match');
    }
    else {
        connection.query('SELECT * FROM user WHERE user_id = ?',[currentUserID],function(error,results,fields) {
            if (decrypt(results[0].password) == currentPassword) {
                connection.query('UPDATE user SET password = ? WHERE user_id = ?',[encrypt(newPassword), currentUserID],function(error,results,fields) {
                    console.log('password updated');
                    connection.query('SELECT * FROM user WHERE user_id = ?;',[currentUserID],function(error,results,fields) {
                        let email = results[0].email;
                        let message = 'Your account password has been updated!'
                        sendEmail(email, message);
                    });
                });
                res.redirect('/editProfile.html');
            }
            else {
                console.log('currentPassword entered does not match records');
            }
        });
    }
})

app.post('/updateHomeAddress', encoder, function(req,res) {
    let street = req.body.street;
    let city = req.body.city;
    let state = req.body.state;
    let zip = req.body.zip;

    connection.query('SELECT * FROM user WHERE user_id = ?',[currentUserID],function(error,results,fields) {
        let homeAddressId = results[0].home_address_id;
        if (homeAddressId != null) {
            const query = 'UPDATE address SET street = ?, city = ?, state = ?, zipcode = ? WHERE address_id = ?'
            connection.query(query,[street, city, state, zip, homeAddressId],function(error,results,fields) {
                console.log('address updated');
                connection.query('SELECT * FROM user WHERE user_id = ?;',[currentUserID],function(error,results,fields) {
                    let email = results[0].email;
                    let message = 'Your account home address has been updated!'
                    sendEmail(email, message);
                });
                res.redirect('/editProfile.html');
            });
        }
        else { // EXCEPTION: home address not assigned yet
            connection.query('INSERT INTO address (street, city, state, country, zipcode) VALUES (?, ?, ?, ?, ?);',[street, city, state, 'United States', zip],function(error,results,fields) {
            });
            connection.query('SELECT * FROM address WHERE street = ? AND city = ? AND state = ? AND country = ? AND zipcode = ?;',[street, city, state, 'United States', zip],function(error,results,fields) {
                let address_id = results[0].address_id;
                connection.query('UPDATE user SET home_address_id = ? WHERE user_id = ?;',[address_id, currentUserID],function(error,results,fields) {
                    console.log('created address');
                    connection.query('SELECT * FROM user WHERE user_id = ?;',[currentUserID],function(error,results,fields) {
                        let email = results[0].email;
                        let message = 'Your account home address has been updated!'
                        sendEmail(email, message);
                    });
                    res.redirect('/editProfile.html');
                });
            });
        }
    });
})

app.post('/updateCard', encoder, function(req,res) {
    registerBody = req.body;
    cardType = registerBody.cardType;
    cardNumber = registerBody.cardNumb;
    cardExpiration = registerBody.expDate;
    const cardExpirationArray = cardExpiration.split('');

    connection.query('SELECT * FROM paymentcard WHERE user_id = ?',[currentUserID],function(error,results,fields) {
        const query = 'UPDATE paymentcard SET type = ?, card_Num = ?, expiration_month = ?, expiration_year = ?  WHERE user_id = ?'
        connection.query(query,[encrypt(cardType), encrypt(cardNumber), encrypt(cardExpirationArray[0] + cardExpirationArray[1]), encrypt(cardExpirationArray[3] + cardExpirationArray[4] + cardExpirationArray[5] + cardExpirationArray[6]), currentUserID] ,function(error,results,fields) {
            connection.query('SELECT * FROM user WHERE user_id = ?;',[currentUserID],function(error,results,fields) {
                let email = results[0].email;
                let message = 'Your account card has been updated!'
                sendEmail(email, message);
            });
            res.redirect('/editPayment.html');
        });
    });
})

app.post('/updateBillingAddress', encoder, function(req,res) {
    let street = req.body.street;
    let city = req.body.city;
    let state = req.body.state;
    let zip = req.body.zip;

    const query = 'SELECT * FROM paymentCard WHERE user_id = ?';
    connection.query(query,[currentUserID],function(error,results,fields) {
        let billingAddressId = results[0].address_id;
        const query = 'UPDATE address SET street = ?, city = ?, state = ?, zipcode = ? WHERE address_id = ?'
        connection.query(query,[street, city, state, zip, billingAddressId],function(error,results,fields) {
            console.log('address updated');
            connection.query('SELECT * FROM user WHERE user_id = ?;',[currentUserID],function(error,results,fields) {
                let email = results[0].email;
                let message = 'Your account billing address has been updated!'
                sendEmail(email, message);
            });
            res.redirect('/editPayment.html');
        });
    });
})

module.exports = {encoder, movieId};
app.listen(4000);