const userController = require("./app/controllers/user.js");
const editUsersController = require("./app/controllers/editUsers.js");
const showtimeController = require("./app/controllers/showtime.js");
const promotionController = require("./app/controllers/promotion.js");
const bookingController = require("./app/controllers/booking.js");
const pageController = require("./app/controllers/page.js");
const utilController = require("./app/controllers/util.js");
const movieController = require("./app/controllers/movie.js");

const express = require("express");
// const bodyParser = require("body-parser"); /* deprecated */

const app = express();

app.use(express.static('.'));

// parse requests of content-type - application/json
app.use(express.json()); /* bodyParser.json() is deprecated */

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); /* bodyParser.urlencoded() is deprecated */

// util
app.post("/getAddress", utilController.getAddress);
app.get("/getAllPromotions", utilController.getAllPromotions);
app.get("/logout", utilController.logout);
app.post("/login", utilController.login);

// showtime
app.get("/getAllShowtimes", showtimeController.getAllShowtimes);
app.post("/addShowtime", showtimeController.addShowtime);
app.post("/editShowtime", showtimeController.editShowtime);

// movie
app.post("/addMovie", movieController.addMovie);
app.post("/editMovie", movieController.editMovie);
app.get("/getAllMovies", movieController.getAllMovies);
app.get("/getUpcomingMovies", movieController.getUpcomingMovies);
app.get("/getNewestReleases", movieController.getNewestReleases);
app.post("/searchMovie", movieController.searchMovie);
app.get("/getMovie", movieController.getMovie);

// promotion
app.get("/getPromo", promotionController.getPromo);
app.post("/addPromotion", promotionController.addPromotion);
app.post("/sendPromotion", promotionController.sendPromotion);
app.post("/removePromotion", promotionController.removePromotion);
app.post('/editPromotion', promotionController.editPromotion);
// pages
app.get("/isLoggedIn", pageController.isLoggedIn);
app.get("/getAllUsers", pageController.getAllUsersInfo);
app.post("/adminEditUserProfile", pageController.adminEditUserProfile);
app.get("/adminGetUserInfo", pageController.getUserInfo);
app.post("/adminPromotions", pageController.adminPromotions);
app.post("/adminEditPromotion", pageController.adminEditPromotion);
app.post("/adminEditShowtimes", pageController.adminEditShowtimes);
app.get("/isIncorrectPassword", pageController.isIncorrectPassword);
app.post("/adminEditMovie", pageController.adminEditMovie);
app.post("/book", pageController.book);
app.get("/userInfo", pageController.userInfo);
app.get("/isInvalidMovie", pageController.isInvalidMovie);
app.get("/isIncorrectShowtime", pageController.isIncorrectShowtime);
app.get("/adminManageMovies", pageController.adminManageMovies);
app.post("/test", pageController.test);

// update users
app.post("/adminUpdateName", editUsersController.updateName);
app.post("/adminUpdatePhone", editUsersController.updatePhone);
app.post("/adminUpdatePassword", editUsersController.updatePassword);
app.post("/adminUpdateHomeAddress", editUsersController.updateHomeAddress);
app.post("/adminUpdateUserType", editUsersController.updateUserType);
app.post("/adminUpdatePromotion", editUsersController.updatePromotion);

// user 
app.post("/register", userController.register);
app.post("/verify", userController.verify);
app.post("/addCard", userController.addCard);
app.get("/getCard", userController.getCard);
app.post("/deleteCard", userController.deleteCard);
app.post("/forgotPassword", userController.forgotPassword);
app.post("/forgotUpdatePassword", userController.forgotUpdatePassword);

// user 2
app.post("/updateName", userController.updateName);
app.post("/updatePhone", userController.updatePhone);
app.post("/updatePromotion", userController.updatePromotion);
app.post("/updatePassword", userController.updatePassword);
app.post("/updateHomeAddress", userController.updateHomeAddress);
app.post("/updateCard", userController.updateCard);
app.post("/updateBillingAddress", userController.updateBillingAddress);

// set port, listen for requests
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
