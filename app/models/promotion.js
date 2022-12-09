const connection = require("./db.js");
let values = require("../values");
let {encrypt, decrypt, sendEmail} = require("../values");

exports.addPromotion = (startDate, endDate, promoCode, promoDiscount, promoBody, res) => {
    let query = 'INSERT INTO promotions (start_date, end_date, promo_code, movie_id, discount, sent, message) VALUES (?, ?, ?, ?, ?, ?, ?);';
     connection.query(query,[startDate, endDate, promoCode, values.getMovieId(), promoDiscount, 0, promoBody],function(error,results,fields) {
         console.log("insert to promotions");
        // console.log(results);
         connection.query('SELECT * FROM promotions WHERE start_date = ? AND end_date = ? AND promo_code = ? AND discount = ? AND message = ?;', [startDate, endDate, promoCode, promoDiscount, promoBody], function(error,results,fields) {
          //  console.log(results);
             promoId = results[0].promo_id;
             values.setPromoId(promoId);  

      });

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
    console.log(values.getPromoId());
    console.log(values.getMovieId());
    const query = 'SELECT * FROM promotions WHERE promo_id = ?';
    connection.query(query,[values.getPromoId()],function(error,results,fields) {
        const query2 = 'SELECT * FROM movie WHERE movie_id = ?';
        connection.query(query2,[values.getMovieId()],function(error,results2,fields) {
           // console.log(results2);

      if (results.length > 0) {
          results[0].img = results2[0].img; // set image source
          res.json(results[0]);
      } else {
          res.json({status: false});
      }
    })
    });
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

exports.getAllPromotions = (req, res) => {
   // WITHOUT ASYNC - USES TIMEOUT AS WORK AROUND
   let sent = 1;
   const promotionsQuery = 'SELECT * FROM promotions WHERE sent = ?';
   connection.query(promotionsQuery,[sent],(error, promoResult, fields) => {
     
     for (let index = 0; index < promoResult.length; index++) {
     const movieQuery = 'SELECT * FROM movie WHERE movie_id = ?';
     const img = [];
     
           connection.query(movieQuery,[promoResult[index].movie_id],(error, results) => {
           //  console.log(results[0].img);
             img[index] = results[0].img;
           });
           
 
           setTimeout(() => {console.log("img " + img[index]);
           promoResult[index].img  = "<img class='img-movie-poster' src='" + img[index] + "'/>";
           promoResult[index].editButton = '<form action="/adminEditPromotion" method="POST"><input style="display: none" type="text" id="promo_id" name="promo_id" value=' + promoResult[index].promo_id + '><input class="button-book-admin" type="submit" value="Edit Promotion"></form>'
           promoResult[index].removeButton = '<form action="/removePromotion" method="POST"><input style="display: none" type="text" id="promo_id" name="promo_id" value=' + promoResult[index].promo_id + '><input class="button-book-admin" type="submit"  value="Remove Promotion"></form>'
         //  console.log("RESULT");
         //  console.log(promoResult);
         }, 900);
         }
         setTimeout(() => {//console.log("getAllP")
         console.log(promoResult);
         res.json(promoResult);
       }, 950);
 });
 }