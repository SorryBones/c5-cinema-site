// PLACE ALL GENERIC ADMIN FUNCTIONS HERE

let values = require("../values");

let model = require("../models/editUsers.js");

exports.updateName = (req, res) => {
    let firstName = req.body.fname;
    let lastName = req.body.lname;
    
    model.updateName(firstName, lastName, res);

    res.redirect('/adminEditUserProfile.html');
};

exports.updatePhone = (req, res) => {
    let phone = req.body.phone;
    
    model.updatePhone(phone, res); 

    res.redirect('/adminEditUserProfile.html');
};

exports.updatePassword = (req, res) => {
    let newPassword = req.body.newPassword;
    let confirmNewPassword = req.body.confirmNewPassword;

    if (newPassword != confirmNewPassword) {
        console.log('passwords dont match');
    }
    else {
        model.updatePassword(newPassword, res);
        res.redirect('/adminEditUserProfile.html');
    }
};

exports.updateHomeAddress = (req, res) => {
    let street = req.body.street;
    let city = req.body.city;
    let state = req.body.state;
    let zip = req.body.zip;

    model.updateHomeAddress(street, city, state, zip, res);
};

exports.updatePromotion = (req, res) => {
    let promotions;
    if (req.body.promotions == 'on') promotions = 'Y';
    else promotions = 'N';

    model.updatePromotion(promotions, res);

    res.redirect('/adminEditUserProfile.html');
};

exports.updateUserType = (req, res) => {
    let utype;
    if (req.body.utype == 'on') utype = 1
    else utype = 2

    model.updateUserType(utype, res);

    res.redirect('/adminEditUserProfile.html');
};