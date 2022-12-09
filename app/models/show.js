const connection = require("./db.js");
let values = require("../values");
let {encrypt, decrypt, sendEmail} = require("../values");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

exports.getAllShowtimes = (res) => {
    let movie_id = values.getMovieId();
    // let today = new Date().toISOString().slice(0, 10);
    const query = "SELECT * FROM showTime WHERE movie_id = 1 AND date BETWEEN '2022-12-09' AND '9999-99-99' ORDER BY date;";
    // connection.query(query,[movie_id, today],function(error,results,fields) {
    connection.query(query,[movie_id],function(error,results,fields) {
        console.log(results)
        if (results.length > 0) {
            res.json(results);
        } else {
            res.json({status: false});
        }
    });
};

// STILL CREATING DUPLICATES
exports.editShowtime = (date, time, id, res) => {
    if (date != '') {
        connection.query('select * from showTime where show_id = ?;',[id],function(error,results,fields) {
            let oldtime = results.time;
            connection.query('select * from showTime where date = ? and time = ?;',[date, oldtime],function(error,results,fields) {
                // if (results.length == 0) {
                if (results[0] == null) {
                    const query = 'UPDATE showTime SET date = ? WHERE show_id = ?';
                    connection.query(query,[date, id],function(error,results,fields) {
                        console.log('date updated');
                    });
                    values.setIsIncorrectShowtime(false);
                } else {
                    values.setIsIncorrectShowtime(true);
                }
            });
        });
    }
    if (time != '') {
        connection.query('select * from showTime where show_id = ?;',[id],function(error,results,fields) {
            let olddate = results.time;
            connection.query('select * from showTime where date = ? and time = ?;',[olddate, time],function(error,results,fields) {
                // if (results.length == 0) {
                if (results[0] == null) {
                    const query = 'UPDATE showTime SET time = ? WHERE show_id = ?';
                    connection.query(query,[time, id],function(error,results,fields) {
                        console.log('date updated');
                    });
                    values.setIsIncorrectShowtime(false);
                } else {
                    values.setIsIncorrectShowtime(true);
                }
            });
        });
    }
};

exports.addShowtime = (date, showtime, res) => {
    connection.query('select * from showTime where date = ? and time = ?;',[date, showtime],function(error,results,fields) { // create
        if (results[0] == null) {
            let query = 'INSERT INTO showTime (movie_id, room_id, date, time) VALUES (?, ?, ?, ?);';
            connection.query(query,[values.getMovieId(), 1, date, showtime],function(error,results,fields) { // get show_id
                let show_id = results.insertId;
                connection.query('SELECT * FROM room WHERE room_id = ?;',[1],function(error,results,fields) { // get numofseats
                    let numberOfSeats = results[0].numofseats;
                    connection.query('select seat_id from showSeat order by seat_id desc limit 0,1;',[],function(error,results,fields) { // get numofseats
                        let startingId;
                        if (results.length > 0) {
                            startingId = results[0].seat_id;
                        } else {
                            startingId = 0;
                        }
                        for (let i = 1; i <= numberOfSeats; i++) { // create showSeat for all seats
                            query = 'INSERT INTO showSeat (seat_id, show_id, room_id, seat_number, availability) VALUES (?, ?, ?, ?, ?);'; 
                            connection.query(query,[startingId+i, show_id, 1, i, 1],function(error,results,fields) {
                            });
                        }
                    });
                });
                console.log('showtime added');
            });
            values.setIsIncorrectShowtime(false);
        } else {
            values.setIsIncorrectShowtime(true);
        }
    });
}

exports.getSeats = async (req, res) => {
    await sleep(500);
    let show_id = req.body.showId;
    const query = 'SELECT * FROM showSeat WHERE show_id = ?';
    connection.query(query,[show_id],function(error,results,fields) {
        if (results.length > 0) {
            res.json(results);
        } else {
            res.json({status: false});
        }
    });
};

exports.addToCart = (req, res) => {
    if (values.getCurrentUserID() != -1) {
        let user_id = values.getCurrentUserID();
        connection.query('SELECT * FROM user WHERE user_id = ?',[user_id],function(error,results,fields){
            let utype_id = results[0].utype_id;
            if (utype_id == 2) { // user
                for (let x in req.body) {
                    values.addToCart(values.getShowId(), x, req.body[x]);
                }
                res.redirect('/cart.html');
            } else { // admin
                console.log('user type is admin');
                values.setIsIncorrectUser(true);
                res.redirect('/book.html');
            }
          })
    }
    else { // guest
        console.log('user type is guest');
        values.setIsIncorrectUser(true);
        res.redirect('/book.html');
    }
};