const connection = require("./db.js");
let values = require("../values");
let { encrypt, decrypt, sendEmail } = require("../values");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

exports.removeItemFromCart = (req, res) => {
    values.removeFromCart(req.body.id);
    res.redirect('back');
};

exports.purchase = (req, res) => {
    let promo_id = null;
    let discount = 0;
    if (req.body.promo != '') {
        let promo_code = req.body.promo;
        connection.query('SELECT * FROM promotions WHERE promo_code = ?', [promo_code], function (error, results, fields) {
            if (results.length > 0) {
                promo_id = results[0].promo_id;
                discount = results[0].discount;
            } else {
                res.json({ status: false });
                return;
            }
        });
    }

    let cart = values.getCart();
    
    if (cart.length > 0) {
    let show_id = cart[0].show_id;
    let movie_id;

    let date;
    let time;
    let title;
    connection.query('SELECT * FROM showTime WHERE show_id = ?',[show_id],function(error,results,fields) {
        if (results.length > 0) {
            movie_id = results[0].movie_id;
            date = results[0].date;
            time = results[0].time;
            let user_id = values.getCurrentUserID();
            let paymentCard_id;
            connection.query('SELECT * FROM paymentCard WHERE user_id = ?',[user_id],function(error,results,fields) {
                if (results.length > 0) {
                    paymentCard_id = results[0].paymentCard_id;

                    let total_price = 0;
                    cart.forEach((element) => {
                        total_price += element.price;
                    });
                    total_price = total_price * ((100-discount)/100); // apply discount
                    total_price = total_price.toFixed(2); // make total_price 2 decimal places

                    connection.query('INSERT INTO booking (total_price, user_id, paymentCard_id, show_id, movie_id, promo_id) VALUES (?, ?, ?, ?, ?, ?);',[total_price, user_id, paymentCard_id, show_id, movie_id, promo_id],function(error,results,fields) {
                        for (index = 0; index < cart.length; index++) {
                            let tickettype_id = cart[index].ticketType;
                            let booking_id = results.insertId ;
                            let seat_number = cart[index].seat_number;
                            connection.query('SELECT * FROM showSeat WHERE show_id = ? AND seat_number = ?;', [show_id, seat_number], function (error, results, fields) {
                                let seat_id = results[0].seat_id;
                                connection.query('INSERT INTO ticket (seat_id, tickettype_id, booking_id) VALUES (?, ?, ?);', [seat_id, tickettype_id, booking_id], function (error, results, fields) {
                                    let ticket_id = results.insertId;
                                    connection.query('UPDATE showSeat SET ticket_id = ?, availability = 0 WHERE seat_id = ?',[ticket_id, seat_id],function(error,results,fields) {
                                       console.log("email " + values.getCurrentUserID())
                                        connection.query('SELECT * FROM movie WHERE movie_id = ?;',[movie_id],function(error,results,fields) {
                                           title = results[0].title;
                                           connection.query('SELECT * FROM user WHERE user_id = ?;',[values.getCurrentUserID()],function(error,results,fields) {
                                            console.log(error);
                                            console.log(results)
                                            let email = results[0].email;
                                            let message = 'Thank you for your purchase!\n\nYou`re tickets are for ';
                                            message += title + " at " + time + " on " + date;
                                            message += `\n\n Enjoy the show!`;
                                            sendEmail(email, message);
                                        });
                                        });
                                    });
                                });
                            });
                        }
                    });
                    values.flushShowSeats();
                    values.flushCart();
                } else {
                    res.json({status: false});
                }
            });
        } else {
            res.json({status: false});
        }
    });

    res.redirect('orderConfirmation.html');
    }
};

exports.getOrderHistory = async (res) => {
    let returnable;
    let user_id = values.getCurrentUserID();
    connection.query('SELECT * FROM booking WHERE user_id = ?',[user_id],function(error,results,fields) {
        if (results.length > 0) {
            returnable = results;
            results.forEach((bookingReturnable) => {
                bookingReturnable.tickets = [];
                let booking_id = bookingReturnable.booking_id;
                connection.query('SELECT * FROM paymentCard WHERE user_id = ?',[user_id],function(error,results,fields) {
                    bookingReturnable.card_num = values.decrypt(results[0].card_num);
                });
                connection.query('SELECT * FROM ticket WHERE booking_id = ?',[booking_id],function(error,results,fields) {
                    results.forEach((ticketReturnable) => {
                        let seat_id = ticketReturnable.seat_id;
                        let tickettype_id = ticketReturnable.tickettype_id
                        connection.query('SELECT * FROM ENUM_ticketType WHERE tickettype_id = ?',[tickettype_id],function(error,results,fields) {
                            let seat_type = results[0].tickettype_name;
                            connection.query('SELECT * FROM showSeat WHERE seat_id = ?',[seat_id],function(error,results,fields) {
                                let seat_number = results[0].seat_number;
                                let show_id = results[0].show_id;
                                connection.query('SELECT * FROM showTime WHERE show_id = ?',[show_id],function(error,results,fields) {
                                    let date = results[0].date;
                                    let time = results[0].time;
                                    let movie_id = results[0].movie_id;
                                    connection.query('SELECT * FROM movie WHERE movie_id = ?',[movie_id],function(error,results,fields) {
                                        let title = results[0].title;
                                        bookingReturnable.tickets.push({title: title, date: date, time: time, seat_number: seat_number, seat_type: seat_type});
                                    });
                                });
                            });
                        });
                    });
                });
            });
        } else {
            return;
        }
    });
    await sleep(750)
    res.json({returnable});
};