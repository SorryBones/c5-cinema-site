// PLACE ALL MISCELLANEOUS FUNCTIONS HERE

let values = require("../values");

let adminModel = require("../models/admin.js");
let bookingModel = require("../models/booking.js");
let pageModel = require("../models/page.js");
let promotionModel = require("../models/promotion.js");
let showtimeModel = require("../models/showtime.js");
let userModel = require("../models/user.js");
let utilModel = require("../models/util.js");

exports.isIncorrectPassword = (req, res) => {
    if (values.getIsIncorrectPassword()) res.json({status: true});
    else res.json({status: false});

    values.setIsIncorrectPassword(false);
};

exports.login = (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    utilModel.login(email, password, req, res);
};