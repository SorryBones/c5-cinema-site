// PLACE ALL USER FUNCTIONS HERE

const Tutorial = require("../models/tutorial.model.js");

let values = require("../values");

exports.isLoggedIn = (req, res) => {
  if (values.getLoggedIn()) res.json({status: true});
  else res.json({status: false});
};

exports.findAll = (req, res) => {
  const title = req.query.title;

  Tutorial.getAll(title, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    else res.send(data);
  });
};

