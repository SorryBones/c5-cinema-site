// PLACE ALL BOOKING FUNCTIONS HERE

let values = require("../values");

let model = require("../models/booking.js");

exports.removeItemFromCart = (req, res) => {
    model.removeItemFromCart(req, res);
};