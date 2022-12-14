// PLACE ALL MISCELLANEOUS FUNCTIONS HERE

let values = require("../values");

let model = require("../models/util.js");

exports.isIncorrectPassword = (req, res) => {
    if (values.getIsIncorrectPassword()) res.json({status: true});
    else res.json({status: false});

    values.setIsIncorrectPassword(false);
};

exports.login = (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    model.login(email, password, req, res);
};

exports.getAddress = (req, res) => {
    let address_id = req.body.id;
    model.getAddress(address_id, res);
};

exports.logout = (req, res) => {
    values.flushShowSeats();
    values.flushCart();
    values.setLoggedIn(false);
    values.setCurrentUserID(-1);
    res.redirect('/login.html');
    console.log('logged out')
};

exports.getCart = (req, res) => {
    model.getCart(res);
};