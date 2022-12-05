const connection = require("./db.js");
let values = require("../values");
let {encrypt, decrypt, sendEmail} = require("../values");

exports.addPromotion = (startDate, endDate, promoCode, promoDiscount, promoBody, promoHeader, movietitle, res) => {
    let query = 'INSERT INTO promotions (start_date, end_date, promo_code, movie_id, discount, sent, message, header, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);';
    connection.query(query,[startDate, endDate, promoCode, values.getMovieId(), promoDiscount, 0, promoBody, promoHeader, movietitle],function(error,results,fields) {
       // console.log(results.insertId());
        console.log("insert to promotions");

        connection.query('SELECT * FROM promotions WHERE start_date = ? AND end_date = ? AND promo_code = ? AND discount = ? AND title = ? AND message = ?;', [startDate, endDate, promoCode, promoDiscount, movietitle, promoBody], function(error,results,fields) {
         console.log(results);
            //   promoId = results[0].promo_id;
           // console.log("here pls");
         //  values.setPromoId(promoId);
        } );
        
       
    });
};

exports.sendPromotion = (res) => {
    connection.query('SELECT * FROM user WHERE promo_subs = ?',['Y'],function(error,results,fields) {
        // SEND EMAILS
        for(let index = 0; index < results.length; index++) {
            let email = results[index].email;
            sendEmail(email, values.getPromoBody());
        }

        // UPDATE PROMO DATABASE (SENT)
        connection.query('UPDATE promotions SET sent = ? WHERE promo_id = ?',[1, values.getPromoId()],function(error,results,fields) {
            console.log("updated promo database")
        });

        console.log("promotion sent");
        res.redirect('/adminMain.html');
    });
};


exports.removePromotion = (res) => {
    connection.query('DELETE from promotions WHERE promo_id = ?',[values.getPromoId()],function(error,results,fields) {
        console.log("promo removed");
    }) 
    res.redirect('/adminPromotions.html');
};

exports.getPromo = (res) => {
    const query = 'SELECT * FROM promotions WHERE promo_id = ?';
    console.log(values.getPromoId());
    connection.query(query,[values.getPromoId()],function(error,results,fields) {
      if (results.length > 0) {
          res.json(results[0]);
      } else {
          res.json({status: false});
      }
    })
  };


  exports.editPromo = (req, res) => {
    isInvalidMovie = false;
    console.log("promo id " + promoId)
        const query = 'SELECT * FROM promotions WHERE promo_id = ?';
        connection.query(query,[promoId],function(error,results,fields) {
        //    let billingAddressId = results[0].address_id;
            if (req.body.title != '') {
                let title = req.body.title;
                const query = 'UPDATE promotions SET title = ? WHERE promo_id = ?';
                connection.query(query,[title, promoId],function(error,results,fields) {
                    console.log('title updated');
                });
            }
            if (req.body.startdate != '') {
                let start = req.body.startdate;
                const query = 'UPDATE promotions SET startdate = ? WHERE promo_id = ?';
                connection.query(query,[start, promoId],function(error,results,fields) {
                    console.log('start updated');
                });
            }
    
            if (req.body.enddate != '') {
                let end = req.body.enddate;
                const query = 'UPDATE promotions SET enddate = ? WHERE promo_id = ?';
                connection.query(query,[end, promoId],function(error,results,fields) {
                    console.log('end updated');
                });
            }
    
            if (req.body.discount != '') {
                let discount = req.body.discount;
                const query = 'UPDATE promotions SET discount = ? WHERE promo_id = ?';
                connection.query(query,[prommocode, promoId],function(error,results,fields) {
                    console.log('discount updated');
                });
            }

            if (req.body.promocode != '') {
                let promocode = req.body.promocode;
                const query = 'UPDATE promotions SET discount = ? WHERE promo_id = ?';
                connection.query(query,[promocode, promoId],function(error,results,fields) {
                    console.log('zip updated');
                });
            }

            if (req.body.header != '') {
                let header = req.body.header;
                const query = 'UPDATE promotions SET header = ? WHERE promo_id = ?';
                connection.query(query,[header, promoId],function(error,results,fields) {
                    console.log('zip updated');
                });
            }

            if (req.body.message != '') {
                let message = req.body.message;
                const query = 'UPDATE promotions SET message = ? WHERE promo_id = ?';
                connection.query(query,[message, promoId],function(error,results,fields) {
                    console.log('zip updated');
                });
            }
           
                connection.query('SELECT * FROM user WHERE user_id = ?;',[currentUserID],function(error,results,fields) {
                    let email = results[0].email;
                    console.log(email)
                    let message = 'Your account billing address has been updated!'
                    sendEmail(email, message);
                });
         });
         res.redirect('/adminEditPromotion.html');
};