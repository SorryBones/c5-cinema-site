const connection = require("./db.js");
let values = require("../values");
let {encrypt, decrypt, sendEmail} = require("../values");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

exports.removeItemFromCart = (req, res) => {
    values.removeFromCart(req.body.id);
    res.redirect('back');
};

exports.purchase = (req, res) => {
    let promo_id = null;
    if (req.body.promo != '') {
        let promo_code = req.body.promo;
        connection.query('SELECT * FROM promotions WHERE promo_code = ?',[promo_code],function(error,results,fields) {
            if (results.length > 0) {
                console.log(results[0]);
                promo_id = results[0].promo_id;
            } else {
                res.json({status: false});
                return;
            }
        });
    }

    let cart = values.getCart();
    let show_id = cart[0].show_id;
    let movie_id;
    connection.query('SELECT * FROM showTime WHERE show_id = ?',[show_id],function(error,results,fields) {
        if (results.length > 0) {
            movie_id = results[0].movie_id;

            let user_id = values.getCurrentUserID();
            let paymentCard_id;
            connection.query('SELECT * FROM paymentCard WHERE user_id = ?',[user_id],function(error,results,fields) {
                if (results.length > 0) {
                    paymentCard_id = results[0].paymentCard_id;

                    let total_price = 0;
                    cart.forEach((element) => {
                        total_price += element.price;
                    });

                    const query = 'INSERT INTO booking (total_price, user_id, paymentCard_id, show_id, movie_id, promo_id) VALUES (?, ?, ?, ?, ?, ?);';
                    connection.query(query,[total_price, user_id, paymentCard_id, show_id, movie_id, promo_id],function(error,results,fields) {
                        console.log('booking added');
                        console.log(error)
                        console.log(fields)
                        console.log(results);

                        let ticketType = cart[0].ticketType;
                        
                        // need to add to ticket (ticket_id, seat_id, ticketType, booking_id)
                        // need to update showSeat to make unavailable and add ticket id
                    });
                } else {
                    res.json({status: false});
                    return;
                }
            });
        } else {
            res.json({status: false});
            return;
        }
    });

    res.redirect('orderConfirmation.html');
};
  