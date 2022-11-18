const user = require("./app/controllers/user.js");
const admin = require("./app/controllers/admin.js");
const showtime = require("./app/controllers/showtime.js");
const promotion = require("./app/controllers/promotion.js");
const user = require("./app/controllers/user.js");
const booking = require("./app/controllers/booking.js");
const page = require("./app/controllers/page.js");
const util = require("./app/controllers/util.js");

const express = require("express");
// const bodyParser = require("body-parser"); /* deprecated */
const cors = require("cors");

const app = express();

app.use(express.static('.'));

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json()); /* bodyParser.json() is deprecated */

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); /* bodyParser.urlencoded() is deprecated */

function sendEmail(email, message) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'flixuga@gmail.com',
      pass: 'ynnjdiferwibooty'
    }
  });
  
  let mailOptions = {
    from: 'flixuga@gmail.com',
    to: email,
    subject: 'Cinema Site Automated Message',
    text: message
  };
  
  transporter.sendMail(mailOptions, function(error, info){
      if (error) {
          console.log(error);
      } else {
          console.log('Email sent: ' + info.response);
      }
  });
}

// simple route
app.post("/login", tutorials.isLoggedIn);
app.post("/forgotPassword", tutorials.isLoggedIn);
app.post("/forgotUpdatePassword", tutorials.isLoggedIn);
app.post("/getAddress", tutorials.isLoggedIn);
app.get("/getAllMovies", tutorials.isLoggedIn);
app.get("/getAllPromotions", tutorials.isLoggedIn);
app.get("/getUpcomingMovies", tutorials.isLoggedIn);
app.get("/getNewestReleases", tutorials.isLoggedIn);
app.post("/book", tutorials.isLoggedIn);
app.post("/searchMovie", tutorials.isLoggedIn);
app.get("/getMovie", tutorials.isLoggedIn);
app.get("/userInfo", tutorials.isLoggedIn);
app.get("/isLoggedIn", tutorials.isLoggedIn);
app.get("/logout", tutorials.isLoggedIn);
app.get("/getPromo", tutorials.isLoggedIn);
app.get("/isInvalidMovie", tutorials.isLoggedIn);
app.get("/isIncorrectPassword", tutorials.isLoggedIn);
app.get("/isIncorrectShowtime", tutorials.isLoggedIn);
app.get("/getAllShowtimes", tutorials.isLoggedIn);
app.get("/adminManageMovies", tutorials.isLoggedIn);
app.post("/addShowtime", tutorials.isLoggedIn);
app.post("/editShowtime", tutorials.isLoggedIn);
app.post("/addMovie", tutorials.isLoggedIn);
app.post("/adminEditMovie", tutorials.isLoggedIn);
app.post("/editMovie", tutorials.isLoggedIn);
app.post("/adminEditShowtimes", tutorials.isLoggedIn);
app.post("/adminPromotions", tutorials.isLoggedIn);
app.post("/addPromotion", tutorials.isLoggedIn);
app.post("/sendPromotion", tutorials.isLoggedIn);
app.post("/removePromotion", tutorials.isLoggedIn);
app.post("/adminEditPromotion", tutorials.isLoggedIn);
app.post("/adminUpdatePromotion", tutorials.isLoggedIn);
app.post("/updatePromotion", tutorials.isLoggedIn);
app.get("/getAllUsers", tutorials.isLoggedIn);
app.post("/adminEditUserProfile", tutorials.isLoggedIn);
app.get("/adminGetUserInfo", tutorials.isLoggedIn);
app.post("/adminUpdateName", tutorials.isLoggedIn);
app.post("/adminUpdatePhone", tutorials.isLoggedIn);
app.post("/adminUpdateUserType", tutorials.isLoggedIn);
app.post("/adminUpdatePromotion", tutorials.isLoggedIn);
app.post("/adminUpdatePassword", tutorials.isLoggedIn);
app.post("/adminUpdateHomeAddress", tutorials.isLoggedIn);
app.post("/register", tutorials.isLoggedIn);
app.post("/verify", tutorials.isLoggedIn);
app.post("/addCard", tutorials.isLoggedIn);
app.get("/getCard", tutorials.isLoggedIn);
app.post("/deleteCard", tutorials.isLoggedIn);
app.post("/updateName", tutorials.isLoggedIn);
app.post("/updatePhone", tutorials.isLoggedIn);
app.post("/updatePassword", tutorials.isLoggedIn);
app.post("/updateHomeAddress", tutorials.isLoggedIn);
app.post("/updateCard", tutorials.isLoggedIn);
app.post("/updateBillingAddress", tutorials.isLoggedIn);

// require("./app/routes/tutorial.routes.js")(app);

// set port, listen for requests
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
