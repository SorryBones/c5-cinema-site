const connection = require("./db.js");
let values = require("../values");
let {encrypt, decrypt, sendEmail} = require("../values");

exports.getAllShowtimes = (res) => {
    const query = 'SELECT * FROM showTime WHERE movie_id = ?';
    connection.query(query,[values.getMovieId()],function(error,results,fields) {
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
    connection.query('select * from showTime where date = ? and time = ?;',[date, showtime],function(error,results,fields) {
        if (results[0] == null) {
            const query = 'INSERT INTO showTime (movie_id, room_id, date, time) VALUES (?, ?, ?, ?);';
            connection.query(query,[values.getMovieId(), 1, date, showtime],function(error,results,fields) {
                console.log('showtime added');
            });
            values.setIsIncorrectShowtime(false);
        } else {
            values.setIsIncorrectShowtime(true);
        }
    });
}