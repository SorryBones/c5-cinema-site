// PLACE ALL MOVIE FUNCTIONS HERE

let values = require("../values");

let model = require("../models/movie.js");

exports.editMovie = (req, res) => {
    let input = req.body;
    model.editMovie(input, res);
    res.redirect('/adminEditMovie.html');
};

exports.getAllMovies = (req, res) => {
    model.getAllMovies(res);
};

exports.getUpcomingMovies = (req, res) => {
    let tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    let tomorrow = tomorrowDate.toISOString().slice(0, 10);
    model.getUpcomingMovies(tomorrow, res);
};

exports.getNewestReleases = (req, res) => {
    let today = new Date().toISOString().slice(0, 10);
    model.getNewestReleases(today, res);
};

exports.searchMovie = (req, res) => {
    let isTitle, isGenre, isRating = false;
    if (req.body.title != '') isTitle = true;
    if (req.body.rating != '') isRating = true;
    if (req.body.genre != '') isGenre = true;

    model.searchMovie(isTitle, isGenre, isRating, req, res);
};

exports.getMovie = (req, res) => {
    model.getMovie(res);
};

exports.addMovie = (req, res) => {
    model.addMovie(req, res);
    res.redirect('/adminMain.html');
};