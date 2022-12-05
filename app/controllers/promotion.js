// PLACE ALL PROMOTION FUNCTIONS HERE

let values = require("../values");

let model = require("../models/promotion.js");

const connection = require("../models/db");

exports.addPromotion = (req, res) => {
    let movieId;
    queryPromise = (title) =>{
        return new Promise((resolve, reject)=>{
            const promotionsQuery = 'SELECT * FROM movie WHERE title = ?';
            connection.query(promotionsQuery,[title],(error, results, fields)=>{
               // console.log(results);
        movieId = results[0].movie_id;
        values.setMovieId(movieId);
                if(error){
                    return reject(error);
                }
              
                return resolve(results);
            });
        });
      };
async function addPromo () {
    let startDate = req.body.startdate;
    let endDate = req.body.enddate;
    let promoCode = req.body.promocode;
    let promoDiscount = req.body.percent;
    let promoBody = req.body.message;
    let title = req.body.title;


  //movieId
    let movieResult = await queryPromise(title);

   /* connection.query('SELECT * FROM movie WHERE title = ?', [title], function(error, results, fields) {
       console.log(results);
        movieId = results[0].movie_id;
    }); */


   
    
  
    //console.log(values.getPromoId());
        
    model.addPromotion(startDate, endDate, promoCode, promoDiscount, promoBody, title, res);

    res.redirect('/adminSendPromo.html');
}
addPromo();
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

exports.editPromotion = (req, res) => {
    
model.editPromotion(req, res);
}