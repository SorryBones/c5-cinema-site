const connection = require("./db.js");
let values = require("../values");
let {encrypt, decrypt, sendEmail} = require("../values");

exports.addPromotion = (startDate, endDate, promoCode, promoDiscount, promoBody, title, res) => {
    let query = 'INSERT INTO promotions (start_date, end_date, promo_code, movie_id, discount, sent, message) VALUES (?, ?, ?, ?, ?, ?, ?);';
    connection.query(query,[startDate, endDate, promoCode, values.getMovieId(), promoDiscount, 0, promoBody],function(error,results,fields) {
        console.log("insert to promotions");
        
    }); 
        connection.query('SELECT * FROM promotions WHERE start_date = ? AND end_date = ? AND promo_code = ? AND discount = ? AND message = ?;', [startDate, endDate, promoCode, promoDiscount, promoBody], function(error,result,fields) {
            promoId = result[0].promo_id;
        //    console.log("assingning promoId");
            values.setPromoId(promoId);
         
       
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
    connection.query(query,[values.getPromoId()],function(error,results,fields) {
      if (results.length > 0) {
          res.json(results[0]);
      } else {
          res.json({status: false});
      }
    })
  };

  exports.editPromotion = (req, res) => {

    console.log("promo id " + values.getPromoId());
    const query = 'SELECT * FROM promotions WHERE promo_id = ?';
    connection.query(query,[values.getPromoId()],function(error,results,fields) {
    //    let billingAddressId = results[0].address_id;
        if (req.body.title != '') {
            let title = req.body.title;
            const query = 'UPDATE promotions SET title = ? WHERE promo_id = ?';
            connection.query(query,[title, values.getPromoId()],function(error,results,fields) {
                console.log('title updated');
            });
        }
        if (req.body.startdate != '') {
            let start = req.body.startdate;
            const query = 'UPDATE promotions SET start_date = ? WHERE promo_id = ?';
            connection.query(query,[start, values.getPromoId()],function(error,results,fields) {
                console.log('start updated');
            });
        }

        if (req.body.enddate != '') {
            let end = req.body.enddate;
            const query = 'UPDATE promotions SET end_date = ? WHERE promo_id = ?';
            connection.query(query,[end, values.getPromoId()],function(error,results,fields) {
                console.log('end updated');
            });
        }

        if (req.body.discount != '') {
            let discount = req.body.discount;
            const query = 'UPDATE promotions SET discount = ? WHERE promo_id = ?';
            connection.query(query,[discount, values.getPromoId()],function(error,results,fields) {
                console.log('discount updated');
            });
        }

        if (req.body.promocode != '') {
            let promocode = req.body.promocode;
            const query = 'UPDATE promotions SET promo_code = ? WHERE promo_id = ?';
            connection.query(query,[promocode, values.getPromoId()],function(error,results,fields) {
                console.log('promo updated');
            });
        }


        if (req.body.message != '') {
            let message = req.body.message;
            const query = 'UPDATE promotions SET message = ? WHERE promo_id = ?';
            connection.query(query,[message, values.getPromoId()],function(error,results,fields) {
                console.log('message body updated');
            });
        }
       
            connection.query('SELECT * FROM user WHERE user_id = ?;',[values.getAdminUserProfileId()],function(error,results,fields) {
            //   console.log(results);
                // let email = results[0].email;
                //console.log(email)
                let message = 'Your account billing address has been updated!'
               // sendEmail(email, message);
            });
     });
     res.redirect('/adminEditPromotion.html');
  }