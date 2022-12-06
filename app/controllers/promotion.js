// PLACE ALL PROMOTION FUNCTIONS HERE

let values = require("../values");

let model = require("../models/promotion.js");

exports.addPromotion = (req, res) => {
    let startDate = req.body.startdate;
    let endDate = req.body.enddate;
    let promoCode = req.body.promocode;
    let promoDiscount = req.body.percent;
    let promoBody = req.body.message;

    values.setPromoBody(promoBody);
        
    model.addPromotion(startDate, endDate, promoCode, promoDiscount, promoBody, res);

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
    model.editPromotion(req, res);
}