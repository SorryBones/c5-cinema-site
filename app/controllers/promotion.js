// PLACE ALL PROMOTION FUNCTIONS HERE

let values = require("../values");

let model = require("../models/promotion.js");

exports.addPromotion = (req, res) => {
    let startDate = req.body.startdate;
    let endDate = req.body.enddate;
    let promoCode = req.body.promocode;
    let promoDiscount = req.body.percent;
    let promoBody = req.body.message;
    let promoHeader = req.body.heading;
    let movietitle = req.body.movietitle;

    console.log(promoHeader);
    values.setPromoBody(promoBody);
        
    model.addPromotion(startDate, endDate, promoCode, promoDiscount, promoBody, promoHeader, movietitle, res);

    res.redirect('/adminSendPromo.html');
};

exports.sendPromotion = (req, res) => {
    model.sendPromotion(res);
};

exports.removePromotion = (req, res) => {
    model.removePromotion(res);
};

exports.getPromo = (req, res) => {
    model.getPromo(res);
};


exports.editPromotion = (req, res) => {
 //let input = req.body;
    model.editPromotion(req, res);
    res.redirect('/adminPromotions.html');
}