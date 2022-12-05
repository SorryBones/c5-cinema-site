// PLACE ALL PROMOTION FUNCTIONS HERE

let values = require("../values");

let model = require("../models/promotion.js");

const connection = require("../models/db");

exports.addPromotion = (req, res) => {
    let startDate = req.body.startdate;
    let endDate = req.body.enddate;
    let promoCode = req.body.promocode;
    let promoDiscount = req.body.percent;
    let promoBody = req.body.message;
    let title = req.body.title;

    let movieId;
    console.log("title " +title);

    let s = req.body.promo_id;

    values.setPromoBody(promoBody);

    connection.query('SELECT * FROM movie WHERE title = ?', [title], function(error, results, fields) {
       console.log(results);
        movieId = results[0].movie_id;
        //console.log(results[0].movie_id);
        values.setMovieId(movieId);
        console.log("movid " + values.getMovieId());
    });


   
    
  
    //console.log(values.getPromoId());
        
    model.addPromotion(startDate, endDate, promoCode, promoDiscount, promoBody, title, res);

    res.redirect('/adminSendPromo.html');
};

exports.sendPromotion = (req, res) => {
    model.sendPromotion(res);
};

exports.removePromotion = (req, res) => {
   let s = req.body.promo_id;
   values.setPromoId(req.body.promo_id);
    console.log("remove promoid " + s );
    model.removePromotion(res);
};

exports.getPromo = (req, res) => {
    model.getPromo(res);
};