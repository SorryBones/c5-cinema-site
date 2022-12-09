// PLACE ALL SHOWTIME FUNCTIONS HERE

let values = require("../values");

let model = require("../models/show.js");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

exports.getSeats = (req, res) => {
    model.getSeats(req, res);
};

exports.selectShowtime = (req, res) => {
    if (req.body.showtime === '') return;
    show_id = req.body.showtime;
    values.setShowId(show_id);
};

exports.selectSeats = (req, res) => {
    values.flushShowSeats();
    for (let x in req.body) {
        values.addShowSeat(x);
    }
};

exports.getSelectedSeats = async (req, res) => {
    await sleep(500);
    let results = values.getShowSeats();
    res.json(results);
};

exports.addToCart = (req, res) => {
     model.addToCart(req, res);
};