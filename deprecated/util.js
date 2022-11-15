// const {connection} = require('./main.js');
var main = require('./main.js');
var currentUserID = main.currentUserID;

const express = require('express');
const router = express.Router();
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const encoder = bodyParser.urlencoded();
const nodemailer = require('nodemailer');
const e = require('express');
const crypto = require('crypto');

app.use(express.static('.'));

const algorithm = "aes-256-cbc";
const key ="12345678123456781234567812345678";
const iv = "zAvR2NI87bBx746n";

function encrypt(message) {
    const encrypter = crypto.createCipheriv(algorithm, key, iv);
    let encryptedMsg = encrypter.update(message, "utf8", "hex");
    encryptedMsg += encrypter.final("hex");
    return encryptedMsg;
}

function decrypt(encryptedMsg) {
    const decrypter = crypto.createDecipheriv(algorithm, key, iv);
    let decryptedMsg = decrypter.update(encryptedMsg, "hex", "utf8");
    decryptedMsg += decrypter.final("utf8");
    console.log(decryptedMsg)
    return decryptedMsg;
}

// connect to database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'NewCES',
});
connection.connect(function(error) {
    if (error) throw error
    else console.log("connected to database")
})

// LOGIN
router.post('/login', encoder, function(req,res) {
    console.log(currentUserID);
    let email = req.body.email;
    let password = req.body.password;

    connection.query('SELECT * FROM user WHERE email = ? AND password = ?',[email, encrypt(password)],function(error,results,fields){
        if (results.length > 0) {
            isIncorrectPassword = false;
            console.log('logged in');
            loggedIn = true;
            currentUserID = results[0].user_id;
            res.redirect('/index.html');
        } else {
            isIncorrectPassword = true;
            console.log('failed to log in');
            res.redirect('/login.html');
        }
    })
})

// // FORGOT PASSWORD
// app.post('/forgotPassword', encoder, function(req,res) {
//     forgotPasswordEmail = req.body.email;
//     verificationCode = Math.floor(100000 + Math.random() * 900000);
//     let message = 'Return to the cinema site and enter this code to reset your password: ' + verificationCode;
//     sendEmail(forgotPasswordEmail, message);

//     res.redirect('/resetPassword.html')
// })

// // GET CARD
// app.get('/getCard', function(req,res) {
//     if (currentUserID != -1) { // if non-null
//         const query = 'SELECT * FROM paymentCard WHERE user_id = ?';
//         connection.query(query,[currentUserID],function(error,results,fields) {
//             if (results.length > 0) {
//                 results[0].card_num = decrypt(results[0].card_num);
//                 results[0].type = decrypt(results[0].type);
//                 results[0].expiration_month = decrypt(results[0].expiration_month);
//                 results[0].expiration_year = decrypt(results[0].expiration_year);
//                 res.json(results[0]);
//             } else {
//                 res.json({status: false});
//             }
//         });
//     }
// })

// // UPDATE TOP BAR (show Profile or Login button)
// app.get('/isLoggedIn', function(req,res) {
//     if (loggedIn) res.json({status: true});
//     else res.json({status: false});
// })

// // LOGOUT
// app.get('/logout', function(req,res) {
//     console.log('logged out')
//     loggedIn = false;
//     currentUserID = -1;
//     res.redirect('/login.html');
// })

// // SEND EMAIL
// function sendEmail(email, message) {
//     let transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: 'kofireevesmiller@gmail.com',
//         pass: 'kqpxvcknnzlqquhi'
//       }
//     });
    
//     let mailOptions = {
//       from: 'kofireevesmiller@gmail.com',
//       to: email,
//       subject: 'Verify Your Account',
//       text: message
//     };
    
//     transporter.sendMail(mailOptions, function(error, info){
//         if (error) {
//             console.log(error);
//         } else {
//             console.log('Email sent: ' + info.response);
//         }
//     });
// }

module.exports = router;