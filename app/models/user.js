const connection = require("./db.js");
let values = require("../values");
let {encrypt, decrypt, sendEmail} = require("../values");

exports.emailTaken = (req) => {
    const query = 'SELECT * FROM user WHERE email = ?'
    return connection.query(query,[req.body.email] ,function(error,results,fields) {
        if (results.length > 0) {
            values.setIsEmailTaken(true);
            console.log('true');
            return true;
        } else {
            values.setIsEmailTaken(false);
            console.log('false');
            return true;
        }
    });
};

exports.createUser = (firstName, lastName, phone, email, password, promotions, homeAddressOptional, paymentOptional, registerBody, res) => {
    let cardType, cardNumber, cardExpiration, billingStreet, billingCity, billingState, billingZip;
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
    connection.query('INSERT INTO user (first_name, last_name, phone_num, email, password, utype_id, status_id, promo_subs) VALUES (?, ?, ?, ?, ?, 2, 1, ?);',[firstName, lastName, phone, email, values.encrypt(password), promotions],function(error,results,fields){
        console.log('created user');
        let message = 'Your Account has been successfully created! Thank you for choosing UGA Flix!'
        values.sendEmail(email, message);
    });

    // create & add address to user
    if (homeAddressOptional) {
        connection.query('INSERT INTO address (street, city, state, country, zipcode) VALUES (?, ?, ?, ?, ?);',[homeStreet, homeCity, homeState, 'United States', homeZip],function(error,results,fields) {
            let address_id = results.insertId;
            connection.query('SELECT * FROM address WHERE street = ? AND city = ? AND state = ? AND country = ? AND zipcode = ?;',[homeStreet, homeCity, homeState, 'United States', homeZip],function(error,results,fields) {
                connection.query('SELECT * FROM user WHERE first_name = ? AND last_name = ? AND phone_num = ? AND email = ? AND password = ?;',[firstName, lastName, phone, email, values.encrypt(password)],function(error,results,fields) {
                    let user_id = results[0].user_id;
                    connection.query('UPDATE user SET home_address_id = ? WHERE user_id = ?;',[address_id, user_id],function(error,results,fields) {
                        console.log('created home address');
                    });
                });
            });
        });
    }

    // create & add payment to user
    if (paymentOptional) {
        const cardExpirationArray = cardExpiration.split('');
        connection.query('INSERT INTO address (street, city, state, country, zipcode) VALUES (?, ?, ?, ?, ?);',[billingStreet, billingCity, billingState, 'United States', billingZip],function(error,results,fields) {
            let address_id = results.insertId;
            connection.query('SELECT * FROM user WHERE email = ?;',[email],function(error,results,fields) {
                let user_id = results[0].user_id;
                connection.query('INSERT INTO paymentCard (card_num, type, expiration_month, expiration_year, user_id, address_id) VALUES (?, ?, ?, ?, ?, ?);',[values.encrypt(cardNumber), values.encrypt(cardType), values.encrypt(cardExpirationArray[0] + cardExpirationArray[1]), values.encrypt(cardExpirationArray[3] + cardExpirationArray[4] + cardExpirationArray[5] + cardExpirationArray[6]), user_id, address_id],function(error,results,fields) {
                    console.log('created card');
                });
            });
        });
    }
};

exports.updateBillingAddress = (street, city, state, zip, res) => {
    let currentUserID = values.getCurrentUserID();
    const query = 'SELECT * FROM paymentCard WHERE user_id = ?';
    connection.query(query,[currentUserID],function(error,results,fields) {
        let billingAddressId = results[0].address_id;
        const query = 'UPDATE address SET street = ?, city = ?, state = ?, zipcode = ? WHERE address_id = ?'
        connection.query(query,[street, city, state, zip, billingAddressId],function(error,results,fields) {
            console.log('address updated');
            connection.query('SELECT * FROM user WHERE user_id = ?;',[currentUserID],function(error,results,fields) {
                let email = results[0].email;
                let message = 'Your account billing address has been updated!'
                values.sendEmail(email, message);
            });
            res.redirect('/editPayment.html');
        });
    });
};

exports.updateCard = (cardType, cardNumber, cardExpirationArray, res) => {
    connection.query('SELECT * FROM paymentcard WHERE user_id = ?',[values.getCurrentUserID()],function(error,results,fields) {
        const query = 'UPDATE paymentcard SET type = ?, card_Num = ?, expiration_month = ?, expiration_year = ?  WHERE user_id = ?'
        connection.query(query,[values.encrypt(cardType), values.encrypt(cardNumber), values.encrypt(cardExpirationArray[0] + cardExpirationArray[1]), values.encrypt(cardExpirationArray[3] + cardExpirationArray[4] + cardExpirationArray[5] + cardExpirationArray[6]), values.getCurrentUserID()] ,function(error,results,fields) {
            connection.query('SELECT * FROM user WHERE user_id = ?;',[values.getCurrentUserID()],function(error,results,fields) {
                let email = results[0].email;
                let message = 'Your account card has been updated!'
                values.sendEmail(email, message);
            });
            res.redirect('/editPayment.html');
        });
    });
};

exports.updateHomeAddress = (street, city, state, zip, res) => {
    connection.query('SELECT * FROM user WHERE user_id = ?',[values.getCurrentUserID()],function(error,results,fields) {
        let homeAddressId = results[0].home_address_id;
        if (homeAddressId != null) {
            const query = 'UPDATE address SET street = ?, city = ?, state = ?, zipcode = ? WHERE address_id = ?'
            connection.query(query,[street, city, state, zip, homeAddressId],function(error,results,fields) {
                console.log('address updated');
                connection.query('SELECT * FROM user WHERE user_id = ?;',[values.getCurrentUserID()],function(error,results,fields) {
                    let email = results[0].email;
                    let message = 'Your account home address has been updated!'
                    values.sendEmail(email, message);
                });
                res.redirect('/editProfile.html');
            });
        }
        else { // EXCEPTION: home address not assigned yet
            connection.query('INSERT INTO address (street, city, state, country, zipcode) VALUES (?, ?, ?, ?, ?);',[street, city, state, 'United States', zip],function(error,results,fields) {
                console.log('added address');
                let address_id = results.insertId;
                connection.query('UPDATE user SET home_address_id = ? WHERE user_id = ?;',[address_id, values.getCurrentUserID()],function(error,results,fields) {
                    console.log('created address');
                    connection.query('SELECT * FROM user WHERE user_id = ?;',[values.getCurrentUserID()],function(error,results,fields) {
                        let email = results[0].email;
                        let message = 'Your account home address has been updated!'
                        values.sendEmail(email, message);
                    });
                    res.redirect('/editProfile.html');
                });
            });
        }
    });
};

exports.updateName = (firstName, lastName, res) => {
    const query = 'UPDATE user SET first_name = ?, last_name = ? WHERE user_id = ?';
    connection.query(query,[firstName, lastName, values.getCurrentUserID()],function(error,results,fields) {
        console.log('name updated');
        connection.query('SELECT * FROM user WHERE user_id = ?;',[values.getCurrentUserID()],function(error,results,fields) {
            let email = results[0].email;
            let message = 'Your account name has been updated!'
            values.sendEmail(email, message);
        });
    });
};

exports.updatePhone = (phone, res) => {
    const query = 'UPDATE user SET phone_num = ? WHERE user_id = ?';
    connection.query(query,[phone, values.getCurrentUserID()],function(error,results,fields) {
        console.log('phone updated');
        connection.query('SELECT * FROM user WHERE user_id = ?;',[values.getCurrentUserID()],function(error,results,fields) {
            let email = results[0].email;
            let message = 'Your account phone number has been updated!'
            values.sendEmail(email, message);
        });
    });
};

exports.updatePromotion = (promotions, res) => {
    const query = 'UPDATE user SET promo_subs = ? WHERE user_id = ?';
    connection.query(query,[promotions, values.getCurrentUserID()],function(error,results,fields) {
        console.log('promotion updated');
        connection.query('SELECT * FROM user WHERE user_id = ?;',[values.getCurrentUserID()],function(error,results,fields) {
            let email = results[0].email;
            let message = 'Your account promotion settings have been updated!'
            sendEmail(email, message);
        });
    });
};

exports.updatePassword = (currentPassword, newPassword, res) => {
    connection.query('SELECT * FROM user WHERE user_id = ?',[values.getCurrentUserID()],function(error,results,fields) {
        if (decrypt(results[0].password) == currentPassword) {
            connection.query('UPDATE user SET password = ? WHERE user_id = ?',[encrypt(newPassword), values.getCurrentUserID()],function(error,results,fields) {
                console.log('password updated');
                connection.query('SELECT * FROM user WHERE user_id = ?;',[values.getCurrentUserID()],function(error,results,fields) {
                    let email = results[0].email;
                    let message = 'Your account password has been updated!'
                    values.sendEmail(email, message);
                });
            });
            res.redirect('/editProfile.html');
        }
        else {
            console.log('currentPassword entered does not match records');
            values.setIsIncorrectUpdatePassword(true);
            res.redirect('/editProfile.html');
        }
    });
};

exports.addCard = (cardType, cardNumber, cardExpirationArray, billingStreet, billingCity, billingState, billingZip, res) => {
    // create & add payment to user
    connection.query('INSERT INTO address (street, city, state, country, zipcode) VALUES (?, ?, ?, ?, ?);',[billingStreet, billingCity, billingState, 'United States', billingZip],function(error,results,fields) {
        console.log('added address');
        let address_id = results.insertId;
        connection.query('INSERT INTO paymentCard (card_num, type, expiration_month, expiration_year, user_id, address_id) VALUES (?, ?, ?, ?, ?, ?);',[values.encrypt(cardNumber), values.encrypt(cardType), values.encrypt(cardExpirationArray[0] + cardExpirationArray[1]), values.encrypt(cardExpirationArray[3] + cardExpirationArray[4] + cardExpirationArray[5] + cardExpirationArray[6]), values.getCurrentUserID(), address_id],function(error,results,fields) {
                console.log('created card');
        });
    });
};

exports.deleteCard = (id, res) => {
    // delete billing address
    console.log(id);
    connection.query('SELECT * FROM paymentCard WHERE paymentCard_id = ?',[id],function(error,results,fields) {
        let address_id = results[0].address_id;
        connection.query('DELETE FROM address WHERE address_id = ?',[address_id],function(error,results,fields) {
            console.log('deleted billing address');
        });
    });

    // delete card
    connection.query('DELETE FROM paymentCard WHERE paymentCard_id = ?',[id],function(error,results,fields) {
        console.log('deleted card');
    });
};

exports.getCard = (res) => {
    const query = 'SELECT * FROM paymentCard WHERE user_id = ?';
    connection.query(query,[values.getCurrentUserID()],function(error,results,fields) {
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
};

exports.forgotUpdatePassword = (newPassword, res) => {
    connection.query('SELECT * FROM user WHERE email = ?;',[values.getForgotPasswordEmail()],function(error,results,fields) {
        let user_id = results[0].user_id;
        connection.query('UPDATE user SET password = ? WHERE user_id = ?',[encrypt(newPassword), user_id],function(error,results,fields) {
            console.log('password updated');
            let email = values.getForgotPasswordEmail();
            let message = 'Your account password has been updated!'
            values.sendEmail(email, message);
            res.redirect('/login.html');
        });
    });
};

exports.userInfo = (res) => {
    const query = 'SELECT * FROM user WHERE user_id = ?';
    connection.query(query,[values.getCurrentUserID()],function(error,results,fields) {
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.json({status: false});
        }
    });
}

exports.getAllUsers = (res) => {
    const query = 'SELECT * FROM user';
    connection.query(query,[],function(error,results,fields) {
        if (results.length > 0) {
            res.json(results);
        } else {
            res.json({status: false});
        }
    });
}

// values.getCurrentUserID()
