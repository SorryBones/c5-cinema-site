// PLACE ALL PROMOTION FUNCTIONS HERE

let values = require("../values");

let model = require("../models/promotion.js");

exports.addPromotion = (req, res) => {

    let startDate = req.body.startdate;
    let endDate = req.body.enddate;
    let promoCode = req.body.promocode;
    let promoDiscount = req.body.percent;
    let promoBody = req.body.message;
    let title = req.body.title;
    let movieId;
       
     movieId = req.body.movie_id;
     
     

   //  setTimeout(() => { model.addPromotion(startDate, endDate, promoCode, promoDiscount, promoBody, res); }, 500); 
   model.addPromotion(startDate, endDate, promoCode, promoDiscount, promoBody, res);
    res.redirect('/adminSendPromo.html');
}

exports.sendPromotion = (req, res) => {
    model.sendPromotion(res);
};

exports.removePromotion = (req, res) => {
    values.setPromoId(req.body.promo_id);
    model.removePromotion(res);
};

exports.getPromo = (req, res) => {
    model.getPromo(res);
};

exports.editPromotion = (req, res) => {
    model.editPromotion(req, res);
}

exports.getAllPromotions = (req, res) => {
    model.getAllPromotions(req, res);
};