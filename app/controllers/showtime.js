// PLACE ALL SHOWTIME FUNCTIONS HERE

let values = require("../values");

let model = require("../models/showtime.js");

exports.getAllShowtimes = (req, res) => {
    model.getAllShowtimes(res);
};

exports.addShowtime = (req, res) => {
    let date = req.body.date;
    let showtime = req.body.showtime;
    model.addShowtime(date, showtime, res);
    res.redirect('/adminEditShowtimes.html');
};

exports.editShowtime = (req, res) => {
    let date = req.body.date;
    let time = req.body.time;
    let id = req.body.id;
    model.editShowtime(date, time, id, res);
    res.redirect('/adminEditShowtimes.html');
};