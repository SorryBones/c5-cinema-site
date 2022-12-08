const connection = require("./db.js");
let values = require("../values");
let {encrypt, decrypt, sendEmail} = require("../values");

exports.removeItemFromCart = (req, res) => {
    values.removeFromCart(req.body.id);
    res.redirect('back');
};
  