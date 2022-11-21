const connection = require("./db.js");
let values = require("../values");
let {encrypt, decrypt, sendEmail} = require("../values");

exports.updateName = (firstName, lastName, res) => {
    const query = 'UPDATE user SET first_name = ?, last_name = ? WHERE user_id = ?';
    connection.query(query,[firstName, lastName, values.getAdminUserProfileId()],function(error,results,fields) {
        console.log('name updated');
        connection.query('SELECT * FROM user WHERE user_id = ?;',[values.getAdminUserProfileId()],function(error,results,fields) {
            let email = results[0].email;
            let message = 'Your account name has been updated!'
            sendEmail(email, message);
        });
    });
};


exports.updatePhone = (phone, res) => {
    const query = 'UPDATE user SET phone_num = ? WHERE user_id = ?';
    connection.query(query,[phone, values.getAdminUserProfileId()],function(error,results,fields) {
        console.log('phone updated');
        connection.query('SELECT * FROM user WHERE user_id = ?;',[values.getAdminUserProfileId()],function(error,results,fields) {
            let email = results[0].email;
            let message = 'Your account phone number has been updated!'
            sendEmail(email, message);
        });
    });
};


exports.updatePassword = (newPassword, res) => {
    connection.query('UPDATE user SET password = ? WHERE user_id = ?',[encrypt(newPassword), values.getAdminUserProfileId()],function(error,results,fields) {
        console.log('password updated');
        connection.query('SELECT * FROM user WHERE user_id = ?;',[values.getAdminUserProfileId()],function(error,results,fields) {
            let email = results[0].email;
            let message = 'Your account password has been updated!'
            sendEmail(email, message);
        });
    });
};


exports.updateHomeAddress = (street, city, state, zip, res) => {
    connection.query('SELECT * FROM user WHERE user_id = ?',[values.getAdminUserProfileId()],function(error,results,fields) {
        let homeAddressId = results[0].home_address_id;
        if (homeAddressId != null) {
            const query = 'UPDATE address SET street = ?, city = ?, state = ?, zipcode = ? WHERE address_id = ?'
            connection.query(query,[street, city, state, zip, homeAddressId],function(error,results,fields) {
                console.log('address updated');
                connection.query('SELECT * FROM user WHERE user_id = ?;',[values.getAdminUserProfileId()],function(error,results,fields) {
                    let email = results[0].email;
                    let message = 'Your account home address has been updated!'
                    sendEmail(email, message);
                });
                res.redirect('/adminEditUserProfile.html');
            });
        }
        else { // EXCEPTION: home address not assigned yet
            connection.query('INSERT INTO address (street, city, state, country, zipcode) VALUES (?, ?, ?, ?, ?);',[street, city, state, 'United States', zip],function(error,results,fields) {
                let address_id = results.insertId;
                connection.query('UPDATE user SET home_address_id = ? WHERE user_id = ?;',[address_id, values.getAdminUserProfileId()],function(error,results,fields) {
                    console.log('created address');
                    connection.query('SELECT * FROM user WHERE user_id = ?;',[values.getAdminUserProfileId()],function(error,results,fields) {
                        let email = results[0].email;
                        let message = 'Your account home address has been updated!'
                        sendEmail(email, message);
                    });
                    res.redirect('/adminEditUserProfile.html');
                });
            });
        }
    });
};

exports.updatePromotion = (promotions, res) => {
    const query = 'UPDATE user SET promo_subs = ? WHERE user_id = ?';
    connection.query(query,[promotions, values.getAdminUserProfileId()],function(error,results,fields) {
        console.log('promotion updated');
        connection.query('SELECT * FROM user WHERE user_id = ?;',[values.getAdminUserProfileId()],function(error,results,fields) {
            let email = results[0].email;
            let message = 'Your account promotion settings have been updated!'
            sendEmail(email, message);
        });
    });
};

exports.updateUserType = (utype, res) => {
    const query = 'UPDATE user SET utype_id = ? WHERE user_id = ?';
    connection.query(query,[utype, values.getAdminUserProfileId()],function(error,results,fields) {
        console.log('utype updated');
        connection.query('SELECT * FROM user WHERE user_id = ?;',[values.getAdminUserProfileId()],function(error,results,fields) {
            let email = results[0].email;
            let message = 'Your account type has been updated!'
            sendEmail(email, message);
        });
    });
};