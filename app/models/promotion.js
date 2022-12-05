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