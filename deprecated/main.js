const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const encoder = bodyParser.urlencoded();
const nodemailer = require('nodemailer');
// const e = require('express');
const crypto = require('crypto');

app.use(express.static('.'));

const utilRoutes = require('./util');
app.use('', utilRoutes);

var adminUserProfileId;
var loggedIn = false;
var currentUserID = -1;
var currentCardID = -1;

var verificationCode;

var registerBody;
var forgotPasswordEmail;

var isIncorrectPassword = false;

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

// ADMIN EDIT USER PROFILE
app.post('/adminEditUserProfile', encoder, function(req,res) {
    adminUserProfileId = req.body.user_id;
    res.redirect('/adminEditUserProfile.html');
})

// GET ALL USERS
app.get('/getAllUsers', encoder, function(req,res) {
    const query = 'SELECT * FROM user';
    connection.query(query,[],function(error,results,fields) {
        res.json(results);
    });
})

// GET ALL USERS
app.get('/getAllUsers', encoder, function(req,res) {
    const query = 'SELECT * FROM user';
    connection.query(query,[],function(error,results,fields) {
        res.json(results);
    });
})

// UPDATE CARD
app.post('/updateCard', encoder, function(req,res) {
    let cardType = req.body.cardType;
    let cardNumb = req.body.cardNumb;
    let cardExpiration = req.body.expDate;


    connection.query('SELECT * FROM user WHERE user_id = ?',[currentUserID],function(error,results,fields) {
        let cardId = results[0].cardId;
        const query = 'UPDATE address SET cardType = ?, cardNumb = ?, cardExpiration = ?,  WHERE cardId = ?'
        connection.query(query,[cardType, cardNumb, cardExpiration] ,function(error,results,fields) {
            console.log('card updated');
            connection.query('SELECT * FROM user WHERE user_id = ?;',[currentUserID],function(error,results,fields) {
                let email = results[0].email;
                let message = 'Your account card has been updated!'
                sendEmail(email, message);
            });
            res.redirect('/editProfile.html');
        });
    });
})

// VERIFY PASSWORD
app.get("/isIncorrectPassword", function(req,res) {
    if (isIncorrectPassword) res.json({status: true});
    else res.json({status: false});

    isIncorrectPassword = false;
})

// LOGIN
// app.post('/login', encoder, function(req,res) {
//     let email = req.body.email;
//     let password = req.body.password;

//     connection.query('SELECT * FROM user WHERE email = ? AND password = ?',[email, encrypt(password)],function(error,results,fields){
//         if (results.length > 0) {
//             isIncorrectPassword = false;
//             console.log('logged in');
//             loggedIn = true;
//             currentUserID = results[0].user_id;
//             res.redirect('/index.html');
//         } else {
//             isIncorrectPassword = true;
//             console.log('failed to log in');
//             res.redirect('/login.html');
//         }
//     })
// })

// REGISTER
app.post('/register', encoder, function(req,res) {
    registerBody = req.body;
    if (req.body.email != req.body.confemail) {
        console.log('emails do not match');
    }
    else if (req.body.password != req.body.confpassword) {
        console.log('passwords do not match');
    }
    else {
        verificationCode = Math.floor(100000 + Math.random() * 900000);
        let message = 'Thanks for creating an account! To verify your account, use this code: ' + verificationCode
        sendEmail(req.body.email, message);

        console.log('verification code:' + verificationCode);

        res.redirect('/registerVerification.html');    
    }
})

// VERIFY & CREATE USER
app.post('/verify', encoder, function(req,res) {
    if (req.body.regCode != verificationCode) {
        console.log('wrong code');
    }
    else {
        console.log('verified');
        let firstName = registerBody.fname;
        let lastName = registerBody.lname;
        let phone = registerBody.phone;
        let email = registerBody.email;
        let password = registerBody.password;
        let promotions;
        if (registerBody.promotions == 'on') promotions = 'Y'
        else promotions = 'N'

        // Optional
        let homeAddressOptional = false;
        if (registerBody.homeStreet != ''
            && registerBody.homeCity != ''
            && registerBody.homeState != ''
            && registerBody.homeZip != '') {
                homeAddressOptional = true;
        }
        let paymentOptional = false;
        if (registerBody.cardType != '' 
            && registerBody.cardNumb != ''
            && registerBody.expDate != ''
            && registerBody.billingStreet != ''
            && registerBody.billingCity != ''
            && registerBody.billingState != ''
            && registerBody.billingZip != '') {
                paymentOptional = true;
        }

        let cardType, cardNumber, cardExpiration;
        let billingStreet, billingCity, billingState, billingZip;
        if (paymentOptional) {
            cardType = registerBody.cardType;
            cardNumber = registerBody.cardNumb;
            cardExpiration = registerBody.expDate;
            billingStreet = registerBody.billingStreet;
            billingCity = registerBody.billingCity;
            billingState = registerBody.billingState;
            billingZip = registerBody.billingZip;
        }

        let homeStreet, homeCity, homeState, homeZip;
        if (homeAddressOptional) {
            homeStreet = registerBody.homeStreet;
            homeCity = registerBody.homeCity;
            homeState = registerBody.homeState;
            homeZip = registerBody.homeZip;
        }

        // create user
        connection.query('INSERT INTO user (first_name, last_name, phone_num, email, password, utype_id, status_id, promo_subs) VALUES (?, ?, ?, ?, ?, 2, 1, ?);',[firstName, lastName, phone, email, encrypt(password), promotions],function(error,results,fields){
            console.log('created user');
            let message = 'Your Account has been successfully created! Thank you for choosing UGA Flix!'
            sendEmail(email, message);
        });

        // create & add address to user
        if (homeAddressOptional) {
            connection.query('INSERT INTO address (street, city, state, country, zipcode) VALUES (?, ?, ?, ?, ?);',[homeStreet, homeCity, homeState, 'United States', homeZip],function(error,results,fields) {
            });
            connection.query('SELECT * FROM address WHERE street = ? AND city = ? AND state = ? AND country = ? AND zipcode = ?;',[homeStreet, homeCity, homeState, 'United States', homeZip],function(error,results,fields) {
                let address_id = results[0].address_id;
                connection.query('SELECT * FROM user WHERE first_name = ? AND last_name = ? AND phone_num = ? AND email = ? AND password = ?;',[firstName, lastName, phone, email, encrypt(password)],function(error,results,fields) {
                    let user_id = results[0].user_id;
                    connection.query('UPDATE user SET home_address_id = ? WHERE user_id = ?;',[address_id, user_id],function(error,results,fields) {
                        console.log('created home address');
                    });
                });
            });
        }

        // create & add payment to user
        if (paymentOptional) {
            const cardExpirationArray = cardExpiration.split('');
            connection.query('INSERT INTO address (street, city, state, country, zipcode) VALUES (?, ?, ?, ?, ?);',[billingStreet, billingCity, billingState, 'United States', billingZip],function(error,results,fields) {
            });
            connection.query('SELECT * FROM address WHERE street = ? AND city = ? AND state = ? AND country = ? AND zipcode = ?;',[billingStreet, billingCity, billingState, 'United States', billingZip],function(error,results,fields) {
                let address_id = results[0].address_id;
                connection.query('SELECT * FROM user WHERE first_name = ? AND last_name = ? AND phone_num = ? AND email = ? AND password = ?;',[firstName, lastName, phone, email, encrypt(password)],function(error,results,fields) {
                    let user_id = results[0].user_id;
                    connection.query('INSERT INTO paymentCard (card_num, type, expiration_month, expiration_year, user_id, address_id) VALUES (?, ?, ?, ?, ?, ?);',[encrypt(cardNumber), encrypt(cardType), encrypt(cardExpirationArray[0] + cardExpirationArray[1]), encrypt(cardExpirationArray[3] + cardExpirationArray[4] + cardExpirationArray[5] + cardExpirationArray[6]), user_id, address_id],function(error,results,fields) {
                        console.log('created card');
                    });
                });
            });
        }

        res.redirect('/registerConfirmation.html');
    }
})

// FORGOT PASSWORD
app.post('/forgotPassword', encoder, function(req,res) {
    forgotPasswordEmail = req.body.email;
    verificationCode = Math.floor(100000 + Math.random() * 900000);
    let message = 'Return to the cinema site and enter this code to reset your password: ' + verificationCode;
    sendEmail(forgotPasswordEmail, message);

    res.redirect('/resetPassword.html')
})

// FORGOT UPDATE PASSWORD
app.post('/forgotUpdatePassword', encoder, function(req,res) {
    let newPassword = req.body.newPassword;
    let confirmNewPassword = req.body.confirmNewPassword;

    if (req.body.regCode != verificationCode) {
        console.log('wrong code');
    }
    else {
        if (newPassword != confirmNewPassword) {
            console.log('passwords dont match');
        }
        else {
            connection.query('SELECT * FROM user WHERE email = ?;',[forgotPasswordEmail],function(error,results,fields) {
                let user_id = results[0].user_id;
                connection.query('UPDATE user SET password = ? WHERE user_id = ?',[encrypt(newPassword), user_id],function(error,results,fields) {
                    console.log('password updated');
                    res.redirect('/login.html');
                });
            });
        }
    }
})

// // ADD CARD
// app.post('/updateCard', encoder, function(req,res) {
//     let cardType = req.body.cardType;
//     let cardNumber = req.body.cardNumb;
//     let cardExpiration = req.body.expDate;

//     const cardExpirationArray = cardExpiration.split('');

//     // create & add payment to user
//     connection.query('INSERT INTO address (street, city, state, country, zipcode) VALUES (?, ?, ?, ?, ?);',[billingStreet, billingCity, billingState, 'United States', billingZip],function(error,results,fields) {
//         console.log('successfully added address');
//     });
//     connection.query('SELECT * FROM address WHERE street = ? AND city = ? AND state = ? AND country = ? AND zipcode = ?;',[billingStreet, billingCity, billingState, 'United States', billingZip],function(error,results,fields) {
//         let paymentCard_id = results[0].address_id;
//         connection.query('INSERT INTO paymentCard (card_num, type, expiration_month, expiration_year, user_id, address_id) VALUES (?, ?, ?, ?, ?, ?);',[encrypt(cardNumber), encrypt(cardType), encrypt(cardExpirationArray[0] + cardExpirationArray[1]), encrypt(cardExpirationArray[3] + cardExpirationArray[4] + cardExpirationArray[5] + cardExpirationArray[6]), currentUserID, address_id],function(error,results,fields) {
//                 console.log('created card');
//         });
//     });

//     res.redirect('/usercards.html');
// })

// ADD CARD
app.post('/addCard', encoder, function(req,res) {
    let cardType = req.body.cardType;
    let cardNumber = req.body.cardNumb;
    let cardExpiration = req.body.expDate;
    let billingStreet = req.body.billingStreet;
    let billingCity = req.body.billingCity;
    let billingState = req.body.billingState;
    let billingZip = req.body.billingZip;

    const cardExpirationArray = cardExpiration.split('');

    // create & add payment to user
    connection.query('INSERT INTO address (street, city, state, country, zipcode) VALUES (?, ?, ?, ?, ?);',[billingStreet, billingCity, billingState, 'United States', billingZip],function(error,results,fields) {
        console.log('successfully added address');
    });
    connection.query('SELECT * FROM address WHERE street = ? AND city = ? AND state = ? AND country = ? AND zipcode = ?;',[billingStreet, billingCity, billingState, 'United States', billingZip],function(error,results,fields) {
        let address_id = results[0].address_id;
        connection.query('INSERT INTO paymentCard (card_num, type, expiration_month, expiration_year, user_id, address_id) VALUES (?, ?, ?, ?, ?, ?);',[encrypt(cardNumber), encrypt(cardType), encrypt(cardExpirationArray[0] + cardExpirationArray[1]), encrypt(cardExpirationArray[3] + cardExpirationArray[4] + cardExpirationArray[5] + cardExpirationArray[6]), currentUserID, address_id],function(error,results,fields) {
                console.log('created card');
        });
    });

    res.redirect('/usercards.html');
})

// GET CARD
app.get('/getCard', function(req,res) {
    if (currentUserID != -1) { // if non-null
        const query = 'SELECT * FROM paymentCard WHERE user_id = ?';
        connection.query(query,[currentUserID],function(error,results,fields) {
            if (results.length > 0) {
                results[0].card_num = decrypt(results[0].card_num);
                results[0].type = decrypt(results[0].type);
                results[0].expiration_month = decrypt(results[0].expiration_month);
                results[0].expiration_year = decrypt(results[0].expiration_year);
                res.json(results[0]);
            } else {
                res.json({status: false});
            }
        });
    }
})

// DELETE CARD
app.post('/deleteCard', encoder, function(req,res) {
    // delete billing address
    connection.query('SELECT * FROM paymentCard WHERE paymentCard_id = ?',[req.body.id],function(error,results,fields) {
        let address_id = results[0].address_id;
        connection.query('DELETE FROM address WHERE address_id = ?',[address_id],function(error,results,fields) {
            console.log('deleted billing address');
        });
    });

    // delete card
    connection.query('DELETE FROM paymentCard WHERE paymentCard_id = ?',[req.body.id],function(error,results,fields) {
        console.log('deleted card');
    });
    res.redirect('/userCards.html');
})

// UPDATE NAME
app.post('/updateName', encoder, function(req,res) {
    let firstName = req.body.fname;
    let lastName = req.body.lname;
    const query = 'UPDATE user SET first_name = ?, last_name = ? WHERE user_id = ?';
    connection.query(query,[firstName, lastName, currentUserID],function(error,results,fields) {
        console.log('name updated');
        connection.query('SELECT * FROM user WHERE user_id = ?;',[currentUserID],function(error,results,fields) {
            let email = results[0].email;
            let message = 'Your account name has been updated!'
            sendEmail(email, message);
        });
    });
    res.redirect('/editProfile.html');
})

// UPDATE PHONE
app.post('/updatePhone', encoder, function(req,res) {
    let phone = req.body.phone;
    const query = 'UPDATE user SET phone_num = ? WHERE user_id = ?';
    connection.query(query,[phone, currentUserID],function(error,results,fields) {
        console.log('phone updated');
        connection.query('SELECT * FROM user WHERE user_id = ?;',[currentUserID],function(error,results,fields) {
            let email = results[0].email;
            let message = 'Your account phone number has been updated!'
            sendEmail(email, message);
        });
    });
    res.redirect('/editProfile.html');
})

// UPDATE PROMOTION
app.post('/updatePromotion', encoder, function(req,res) {
    let promotions;
    if (req.body.promotions == 'on') promotions = 'Y'
    else promotions = 'N'
    const query = 'UPDATE user SET promo_subs = ? WHERE user_id = ?';
    connection.query(query,[promotions, currentUserID],function(error,results,fields) {
        console.log('promotion updated');
        connection.query('SELECT * FROM user WHERE user_id = ?;',[currentUserID],function(error,results,fields) {
            let email = results[0].email;
            let message = 'Your account promotion settings have been updated!'
            sendEmail(email, message);
        });
    });
    res.redirect('/editProfile.html');
})

// UPDATE PASSWORD
app.post('/updatePassword', encoder, function(req,res) {
    let currentPassword = req.body.currentPassword;
    let newPassword = req.body.newPassword;
    let confirmNewPassword = req.body.confirmNewPassword;

    if (newPassword != confirmNewPassword) {
        console.log('passwords dont match');
    }
    else {
        connection.query('SELECT * FROM user WHERE user_id = ?',[currentUserID],function(error,results,fields) {
            if (decrypt(results[0].password) == currentPassword) {
                connection.query('UPDATE user SET password = ? WHERE user_id = ?',[encrypt(newPassword), currentUserID],function(error,results,fields) {
                    console.log('password updated');
                    connection.query('SELECT * FROM user WHERE user_id = ?;',[currentUserID],function(error,results,fields) {
                        let email = results[0].email;
                        let message = 'Your account password has been updated!'
                        sendEmail(email, message);
                    });
                });
                res.redirect('/editProfile.html');
            }
            else {
                console.log('currentPassword entered does not match records');
            }
        });
    }
})

// UPDATE ADDRESS
app.post('/updateHomeAddress', encoder, function(req,res) {
    let street = req.body.street;
    let city = req.body.city;
    let state = req.body.state;
    let zip = req.body.zip;

    connection.query('SELECT * FROM user WHERE user_id = ?',[currentUserID],function(error,results,fields) {
        let homeAddressId = results[0].home_address_id;
        if (homeAddressId != null) {
            const query = 'UPDATE address SET street = ?, city = ?, state = ?, zipcode = ? WHERE address_id = ?'
            connection.query(query,[street, city, state, zip, homeAddressId],function(error,results,fields) {
                console.log('address updated');
                connection.query('SELECT * FROM user WHERE user_id = ?;',[currentUserID],function(error,results,fields) {
                    let email = results[0].email;
                    let message = 'Your account home address has been updated!'
                    sendEmail(email, message);
                });
                res.redirect('/editProfile.html');
            });
        }
        else { // EXCEPTION: home address not assigned yet
            connection.query('INSERT INTO address (street, city, state, country, zipcode) VALUES (?, ?, ?, ?, ?);',[street, city, state, 'United States', zip],function(error,results,fields) {
            });
            connection.query('SELECT * FROM address WHERE street = ? AND city = ? AND state = ? AND country = ? AND zipcode = ?;',[street, city, state, 'United States', zip],function(error,results,fields) {
                let address_id = results[0].address_id;
                connection.query('UPDATE user SET home_address_id = ? WHERE user_id = ?;',[address_id, currentUserID],function(error,results,fields) {
                    console.log('created address');
                    connection.query('SELECT * FROM user WHERE user_id = ?;',[currentUserID],function(error,results,fields) {
                        let email = results[0].email;
                        let message = 'Your account home address has been updated!'
                        sendEmail(email, message);
                    });
                    res.redirect('/editProfile.html');
                });
            });
        }
    });
})

// GET ADDRESS
app.post('/getAddress', encoder, function(req,res) {
    let address_id = req.body.id;
    const query = 'SELECT * FROM address WHERE address_id = ?';
    connection.query(query,[address_id],function(error,results,fields) {
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.json({status: false});
        }
    });
})

// GET USER
app.get("/userInfo", function(req,res) {
    if (currentUserID != -1) { // if non-null
        const query = 'SELECT * FROM user WHERE user_id = ?';
        connection.query(query,[currentUserID],function(error,results,fields) {
            if (results.length > 0) {
                res.json(results[0]);
            } else {
                res.json({status: false});
            }
        });
    }
})

// UPDATE TOP BAR (show Profile or Login button)
app.get('/isLoggedIn', function(req,res) {
    if (loggedIn) res.json({status: true});
    else res.json({status: false});
})

// LOGOUT
app.get('/logout', function(req,res) {
    console.log('logged out')
    loggedIn = false;
    currentUserID = -1;
    res.redirect('/login.html');
})

// SEND EMAIL
function sendEmail(email, message) {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'kofireevesmiller@gmail.com',
        pass: 'kqpxvcknnzlqquhi'
      }
    });
    
    let mailOptions = {
      from: 'kofireevesmiller@gmail.com',
      to: email,
      subject: 'Verify Your Account',
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

app.listen(4000);

// module.exports = {
//     currentUserID: currentUserID,
// };
module.exports.currentUserID = currentUserID;