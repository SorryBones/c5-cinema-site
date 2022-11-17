/*
* CMD + K + 1 to collapse level 1
* CMD + K + J to uncollapse level 1
*/

const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const encoder = bodyParser.urlencoded();
const app = express();
const nodemailer = require('nodemailer');
const e = require('express');
const crypto = require('crypto');

app.use(express.static('.'));

var adminUserProfileId;
var loggedIn = false;
var currentUserID = -1;

var verificationCode;

var registerBody;
var forgotPasswordEmail;

var isIncorrectPassword = false;

var isInvalidMovie = false;
var promoMovieId;

var promoHeader;
var promoBody;
var promoDiscount;
var promoId;

const algorithm = "aes-256-cbc";
const key ="12345678123456781234567812345678";
const iv = "zAvR2NI87bBx746n";

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

// set up database encryption
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

/* --------- UTIL --------- */

app.post('/login', encoder, function(req,res) {
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

app.post('/forgotPassword', encoder, function(req,res) {
    forgotPasswordEmail = req.body.email;
    verificationCode = Math.floor(100000 + Math.random() * 900000);
    let message = 'Return to the cinema site and enter this code to reset your password: ' + verificationCode;
    sendEmail(forgotPasswordEmail, message);

    res.redirect('/resetPassword.html')
})

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

app.get("/userInfo", function(req,res) {
    if (currentUserID != -1) { // if non-null
        const query = 'SELECT * FROM user WHERE user_id = ?';
        connection.query(query,[currentUserID],function(error,results,fields) {
            if (results.length > 0) {
                res.json(results[0]);
                console.log("user info");
            } else {
                res.json({status: false});
            }
        });
    }
})

app.get("/getPromo", function(req, res) {
    
    const query = 'SELECT * FROM promotions WHERE promo_id = ?';
    connection.query(query,[promoId],function(error,results,fields) {
        if (results.length > 0) {
            res.json(results[0]);
           // console.log("get promo");
        } else {
            res.json({status: false});
        }
        
    })
});


app.get("/getPromoMovieTitle", function(req, res) {
   //console.log("movie id is " + promoMovieId);
    const query = 'SELECT * FROM movie WHERE id_movie = ?';
    connection.query(query,[promoMovieId],function(error,results,fields) {
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.json({status: false});
        }
        
    })
});

app.get('/isLoggedIn', function(req,res) {
    if (loggedIn) res.json({status: true});
    else res.json({status: false});
})

app.get('/logout', function(req,res) {
    console.log('logged out')
    loggedIn = false;
    currentUserID = -1;
    res.redirect('/login.html');
})

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


app.get("/isInvalidMovie", function(req,res) {
    if (!isInvalidMovie) {
        res.json({status: false});
       // console.log("default movie");
    } else { 
        res.json({status: true});
console.log("no movie found");
    }
    //isValidMovie = false;
})
/* --------- ADMIN --------- */

app.post('/addPromotion', encoder, function(req,res) {
  promoBody = req.body.message;
  promoHeader = req.body.heading;
  promoDiscount = req.body.percent;
  let promocode = req.body.promocode;
  let startdate = req.body.startdate;
  let enddate = req.body.enddate;
  let movietitle = req.body.movietitle;
  
    let promotion = 'Y';
    let sent = 0;
    let found = false;

    connection.query('SELECT * FROM movie' , function(error,results,fields) {
      isInvalidMovie = false;
      
        for(let index = 0; index < results.length; index++) {
            let title = results[index].title;
            
           if (title == movietitle) {
            found = true;
            console.log("movie found");
            if (found) {
                promoMovieId = results[index].id_movie;
                console.log("movieid is " + promoMovieId);
                connection.query('INSERT INTO promotions (start_date, end_date, promo_code, movie_id, discount, sent, message) VALUES (?, ?, ?, ?, ?, ?, ?);',[startdate, enddate, promocode, promoMovieId, promoDiscount, sent, promoBody],function(error,results,fields) {
                    console.log("insert to promotions");
                    });

                    connection.query('SELECT * FROM promotions WHERE start_date = ? AND end_date = ? AND promo_code = ? AND discount = ? AND movie_id = ? AND message = ?;', [startdate, enddate, promocode, promoDiscount, promoMovieId, promoBody], function(error,results,fields) {
                        promoId = results[0].promo_id;
                       // console.log("here pls");
                    } );

           }
        } else { 
            console.log("invalid");
            isInvalidMovie = true;
    }

    }

    if (found) {
        res.redirect('/adminSendPromo.html');
    } else {
        res.redirect('/adminPromotions.html'); 
    }
    });
});
   
  


// SEND PROMOTION
app.post('/sendPromotion', encoder, function(req,res) {
   
    let promotion = 'Y';
   // console.log(message);
    connection.query('SELECT * FROM user WHERE promo_subs = ?',[promotion],function(error,results,fields) {
    console.log(results);

    // SEND EMAILS
    for(let index = 0; index < results.length; index++) {
        let email = results[index].email;
       sendEmail(email, promoBody, promoHeader);
    }

    // UPDATE PROMO DATABASE (SENT)
    let sent = 1;
    connection.query('UPDATE promotions SET sent = ? WHERE promo_id = ?',[sent, promoId],function(error,results,fields) {
    console.log("updated promo database")
    });

    console.log("promotion sent");
    res.redirect('/adminMain.html');
    });
})

app.post('/removePromotion', function(req,res) {
    connection.query('DELETE from promotions WHERE promo_id = ?',[promoId],function(error,results,fields) {
        console.log("promo removed");
    }) 
    res.redirect('/adminPromotions.html');
})

app.get('/getAllUsers', encoder, function(req,res) {
    const query = 'SELECT * FROM user';
    connection.query(query,[],function(error,results,fields) {
        res.json(results);
    });
})

app.post('/adminEditUserProfile', encoder, function(req,res) {
    adminUserProfileId = req.body.user_id;
    res.redirect('/adminEditUserProfile.html');
})

app.get("/adminGetUserInfo", function(req,res) {
    const query = 'SELECT * FROM user WHERE user_id = ?';
    connection.query(query,[adminUserProfileId],function(error,results,fields) {
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.json({status: false});
        }
    });
})

app.post('/adminUpdateName', encoder, function(req,res) {
    let firstName = req.body.fname;
    let lastName = req.body.lname;
    const query = 'UPDATE user SET first_name = ?, last_name = ? WHERE user_id = ?';
    connection.query(query,[firstName, lastName, adminUserProfileId],function(error,results,fields) {
        console.log('name updated');
        connection.query('SELECT * FROM user WHERE user_id = ?;',[adminUserProfileId],function(error,results,fields) {
            let email = results[0].email;
            let message = 'Your account name has been updated!'
            sendEmail(email, message);
        });
    });
    res.redirect('/adminEditUserProfile.html');
})

app.post('/adminUpdatePhone', encoder, function(req,res) {
    let phone = req.body.phone;
    const query = 'UPDATE user SET phone_num = ? WHERE user_id = ?';
    connection.query(query,[phone, adminUserProfileId],function(error,results,fields) {
        console.log('phone updated');
        connection.query('SELECT * FROM user WHERE user_id = ?;',[adminUserProfileId],function(error,results,fields) {
            let email = results[0].email;
            let message = 'Your account phone number has been updated!'
            sendEmail(email, message);
        });
    });
    res.redirect('/adminEditUserProfile.html');
})

app.post('/adminUpdateUserType', encoder, function(req,res) {
    let utype;
    if (req.body.utype == 'on') utype = 1
    else utype = 2
    const query = 'UPDATE user SET utype_id = ? WHERE user_id = ?';
    connection.query(query,[utype, adminUserProfileId],function(error,results,fields) {
        console.log('utype updated');
        connection.query('SELECT * FROM user WHERE user_id = ?;',[adminUserProfileId],function(error,results,fields) {
            let email = results[0].email;
            let message = 'Your account type has been updated!'
            sendEmail(email, message);
        });
    });
    res.redirect('/adminEditUserProfile.html');
})

app.post('/adminUpdatePromotion', encoder, function(req,res) {
    let promotions;
    if (req.body.promotions == 'on') promotions = 'Y'
    else promotions = 'N'
    const query = 'UPDATE user SET promo_subs = ? WHERE user_id = ?';
    connection.query(query,[promotions, adminUserProfileId],function(error,results,fields) {
        console.log('promotion updated');
        connection.query('SELECT * FROM user WHERE user_id = ?;',[adminUserProfileId],function(error,results,fields) {
            let email = results[0].email;
            let message = 'Your account promotion settings have been updated!'
            sendEmail(email, message);
        });
    });
    res.redirect('/adminEditUserProfile.html');
})

app.post('/adminUpdatePassword', encoder, function(req,res) {
    let newPassword = req.body.newPassword;
    let confirmNewPassword = req.body.confirmNewPassword;

    if (newPassword != confirmNewPassword) {
        console.log('passwords dont match');
    }
    else {
        connection.query('UPDATE user SET password = ? WHERE user_id = ?',[encrypt(newPassword), adminUserProfileId],function(error,results,fields) {
            console.log('password updated');
            connection.query('SELECT * FROM user WHERE user_id = ?;',[adminUserProfileId],function(error,results,fields) {
                let email = results[0].email;
                let message = 'Your account password has been updated!'
                sendEmail(email, message);
            });
        });
        res.redirect('/adminEditUserProfile.html');
    }
})

app.post('/adminUpdateHomeAddress', encoder, function(req,res) {
    let street = req.body.street;
    let city = req.body.city;
    let state = req.body.state;
    let zip = req.body.zip;

    connection.query('SELECT * FROM user WHERE user_id = ?',[adminUserProfileId],function(error,results,fields) {
        let homeAddressId = results[0].home_address_id;
        if (homeAddressId != null) {
            const query = 'UPDATE address SET street = ?, city = ?, state = ?, zipcode = ? WHERE address_id = ?'
            connection.query(query,[street, city, state, zip, homeAddressId],function(error,results,fields) {
                console.log('address updated');
                connection.query('SELECT * FROM user WHERE user_id = ?;',[adminUserProfileId],function(error,results,fields) {
                    let email = results[0].email;
                    let message = 'Your account home address has been updated!'
                    sendEmail(email, message);
                });
                res.redirect('/adminEditUserProfile.html');
            });
        }
        else { // EXCEPTION: home address not assigned yet
            connection.query('INSERT INTO address (street, city, state, country, zipcode) VALUES (?, ?, ?, ?, ?);',[street, city, state, 'United States', zip],function(error,results,fields) {
            });
            connection.query('SELECT * FROM address WHERE street = ? AND city = ? AND state = ? AND country = ? AND zipcode = ?;',[street, city, state, 'United States', zip],function(error,results,fields) {
                let address_id = results[0].address_id;
                connection.query('UPDATE user SET home_address_id = ? WHERE user_id = ?;',[address_id, adminUserProfileId],function(error,results,fields) {
                    console.log('created address');
                    connection.query('SELECT * FROM user WHERE user_id = ?;',[adminUserProfileId],function(error,results,fields) {
                        let email = results[0].email;
                        let message = 'Your account home address has been updated!'
                        sendEmail(email, message);
                    });
                    res.redirect('/adminEditUserProfile.html');
                });
            });
        }
    });
})

/* --------- USER --------- */

app.get("/isIncorrectPassword", function(req,res) {
    if (isIncorrectPassword) res.json({status: true});
    else res.json({status: false});

    isIncorrectPassword = false;
})

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

app.get('/getCard', function(req,res) {
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
})

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

app.post('/updateCard', encoder, function(req,res) {
    registerBody = req.body;
    cardType = registerBody.cardType;
    cardNumber = registerBody.cardNumb;
    cardExpiration = registerBody.expDate;
    const cardExpirationArray = cardExpiration.split('');

    connection.query('SELECT * FROM paymentcard WHERE user_id = ?',[currentUserID],function(error,results,fields) {
        const query = 'UPDATE paymentcard SET type = ?, card_Num = ?, expiration_month = ?, expiration_year = ?  WHERE user_id = ?'
        connection.query(query,[encrypt(cardType), encrypt(cardNumber), encrypt(cardExpirationArray[0] + cardExpirationArray[1]), encrypt(cardExpirationArray[3] + cardExpirationArray[4] + cardExpirationArray[5] + cardExpirationArray[6]), currentUserID] ,function(error,results,fields) {
            connection.query('SELECT * FROM user WHERE user_id = ?;',[currentUserID],function(error,results,fields) {
                let email = results[0].email;
                let message = 'Your account card has been updated!'
                sendEmail(email, message);
            });
            res.redirect('/editPayment.html');
        });
    });
})

app.post('/updateBillingAddress', encoder, function(req,res) {
    let street = req.body.street;
    let city = req.body.city;
    let state = req.body.state;
    let zip = req.body.zip;

    const query = 'SELECT * FROM paymentCard WHERE user_id = ?';
    connection.query(query,[currentUserID],function(error,results,fields) {
        let billingAddressId = results[0].address_id;
        const query = 'UPDATE address SET street = ?, city = ?, state = ?, zipcode = ? WHERE address_id = ?'
        connection.query(query,[street, city, state, zip, billingAddressId],function(error,results,fields) {
            console.log('address updated');
            connection.query('SELECT * FROM user WHERE user_id = ?;',[currentUserID],function(error,results,fields) {
                let email = results[0].email;
                let message = 'Your account billing address has been updated!'
                sendEmail(email, message);
            });
            res.redirect('/editPayment.html');
        });
    });
})

app.listen(4000);