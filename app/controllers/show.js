// PLACE ALL SHOWTIME FUNCTIONS HERE

let values = require("../values");

let model = require("../models/show.js");

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
    let show_id = req.body.showId;
    model.getSeats(show_id, res);
};

exports.selectShowtime = (req, res) => {
    if (req.body.showtime === '') return;
    show_id = req.body.showtime;
    values.setShowId(show_id);
    console.log("blue" + values.getMovieId())
};

exports.selectSeats = (req, res) => {
    values.flushShowSeats();
    for (let x in req.body) {
        values.addShowSeat(x);
    }

    console.log("green" + values.getMovieId())
};

exports.getSelectedSeats = (req, res) => {
    let results = values.getShowSeats();
    res.json(results);
};

exports.addToCart = (req, res) => {
 
    for (let x in req.body) {
        values.addToCart(values.getShowId(), x, req.body[x]);
    }
    console.log(values.getCart());

let cart = values.getCart();
let sum = 0;

    for (index = 0; index < cart.length; index++) {

        if (cart[index].ticketType == 1)  sum += 14.99;
		if (cart[index].ticketType == 2)  sum += 10.99 
		if (cart[index].ticketType == 3)  sum += 12.99;
        console.log(sum);
    }

    values.setCartTotal(sum);
    res.redirect('/orderSummary.html');
};

exports.getCartShowtime = (req, res) => {
model.getCartShowtime(req, res);
}

exports.getCartSeatNumber = (req, res) => {
    model.getCartSeatNumber(req, res);
}