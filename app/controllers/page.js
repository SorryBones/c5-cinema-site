// PLACE ALL PAGE LOADING FUNCTIONS HERE

let values = require("../values");

let adminModel = require("../models/editUsers.js");
let userModel = require("../models/user.js");
let pageModel = require("../models/page.js");

exports.isIncorrectPassword = (req, res) => {
    if (values.getIsIncorrectPassword()) res.json({status: true});
    else res.json({status: false});

    values.setIsIncorrectPassword(false);
};

exports.isIncorrectShowtime = (req, res) => {
    if (values.getIsIncorrectShowtime()) res.json({status: true});
    else res.json({status: false});
};

exports.isLoggedIn = (req, res) => {
    if (values.getLoggedIn()) res.json({status: true});
    else res.json({status: false});
};

exports.getAllUsers = (req, res) => {
    userModel.getAllUsers(res);
};

exports.adminEditUserProfile = (req, res) => {
    values.setAdminUserProfileId(req.body.user_id);
    res.redirect('/adminEditUserProfile.html');
};

exports.getUserInfo = (req, res) => {
    pageModel.getUserInfo(res);
};

exports.adminPromotions = (req, res) => {
    values.setMovieId(req.body.movie_id);
    res.redirect('/adminPromotions.html');
};

exports.adminEditPromotion = (req, res) => {
    values.setPromoId(req.body.promo_id);
    res.redirect('/adminEditPromotion.html');
};

exports.adminEditShowtimes = (req, res) => {
    values.setMovieId(req.body.movie_id);
    res.redirect('/adminEditShowtimes.html');
};

exports.book = (req, res) => {
    //values.setMovieId(req.body.movie_id);
    res.redirect('/book.html');
};

exports.userInfo = (req, res) => {
    if (values.getCurrentUserID() != -1) { // if non-null
        userModel.userInfo(res);
    }
};

exports.isInvalidMovie = (req, res) => {
    if (!values.getIsInvalidMovie()) {
        res.json({status: false});
    } else { 
        res.json({status: true});
    }
    //isValidMovie = false;
};

exports.adminManageMovies = (req, res) => {
    pageModel.adminManageMovies(res);
};

exports.adminEditMovie = (req, res) => {
    values.setMovieId(req.body.movie_id);
    res.redirect('/adminEditMovie.html');
};

exports.getAllUsersInfo = (req, res) => {
    pageModel.getAllUsersInfo(res);
};

exports.adminEditPromotion = (req, res) =>  {
    pageModel.adminEditPromotion(res);
}