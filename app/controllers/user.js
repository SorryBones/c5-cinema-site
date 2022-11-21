// PLACE ALL USER FUNCTIONS HERE

let values = require("../values");

let model = require("../models/user.js");

exports.register = (req, res) => {
  values.setRegisterBody(req.body);
    if (req.body.email != req.body.confemail) {
        console.log('emails do not match');
    }
    else if (req.body.password != req.body.confpassword) {
        console.log('passwords do not match');
    }
    else {
        values.setVerificationCode(Math.floor(100000 + Math.random() * 900000));
        let message = 'Thanks for creating an account! To verify your account, use this code: ' + values.getVerificationCode();
        values.sendEmail(req.body.email, message);

        console.log('verification code: ' + values.getVerificationCode());

        res.redirect('/registerVerification.html');    
    }
};

exports.verify = (req, res) => {
  let registerBody = values.getRegisterBody();
  if (req.body.regCode != values.getVerificationCode()) {
    console.log('wrong code');
  }
  else {
      console.log('verified');
      let firstName = registerBody.fname;
      let lastName = registerBody.lname;
      let phone = registerBody.phone;
      let email = registerBody.email;
      let password = registerBody.password;
      let promotions;
      if (registerBody.promotions == 'on') promotions = 'Y'
      else promotions = 'N'

      // Optionals
      let homeAddressOptional = false;
      if (registerBody.homeStreet != ''
          && registerBody.homeCity != ''
          && registerBody.homeState != ''
          && registerBody.homeZip != '') {
              homeAddressOptional = true;
      }
      let paymentOptional = false;
      if (registerBody.cardType != '' 
          && registerBody.cardNumb != ''
          && registerBody.expDate != ''
          && registerBody.billingStreet != ''
          && registerBody.billingCity != ''
          && registerBody.billingState != ''
          && registerBody.billingZip != '') {
              paymentOptional = true;
      }

      model.createUser(firstName, lastName, phone, email, password, promotions, homeAddressOptional, paymentOptional, registerBody, res);
      

      res.redirect('/registerConfirmation.html');
  }
};

exports.updateBillingAddress = (req, res) => {
  let street = req.body.street;
  let city = req.body.city;
  let state = req.body.state;
  let zip = req.body.zip;

  model.updateBillingAddress(street, city, state, zip, res);
};

exports.updateHomeAddress = (req, res) => {
  let street = req.body.street;
  let city = req.body.city;
  let state = req.body.state;
  let zip = req.body.zip;

  model.updateHomeAddress(street, city, state, zip, res);
};

exports.updateCard = (req, res) => {
    let cardType = req.body.cardType;
    let cardNumber = req.body.cardNumb;
    let cardExpiration = req.body.expDate;
    const cardExpirationArray = cardExpiration.split('');

    model.updateCard(cardType, cardNumber, cardExpirationArray, res);
};

exports.updateName = (req, res) => {
  let firstName = req.body.fname;
  let lastName = req.body.lname;

  model.updateName(firstName, lastName, res);
  
  res.redirect('/editProfile.html');
};

exports.updatePhone = (req, res) => {
    let phone = req.body.phone;

    model.updatePhone(phone, res);

    res.redirect('/editProfile.html');
};

exports.updatePromotion = (req, res) => {
    let promotions;
    if (req.body.promotions == 'on') promotions = 'Y'
    else promotions = 'N'

    model.updatePromotion(promotions, res);

    res.redirect('/editProfile.html');
};

exports.updatePassword = (req, res) => {
    let currentPassword = req.body.currentPassword;
    let newPassword = req.body.newPassword;
    let confirmNewPassword = req.body.confirmNewPassword;

    if (newPassword != confirmNewPassword) {
        console.log('passwords dont match');
    }
    else {
        model.updatePassword(currentPassword, newPassword, res);
    }
}

exports.addCard = (req, res) => {
    let cardType = req.body.cardType;
    let cardNumber = req.body.cardNumb;
    let cardExpiration = req.body.expDate;
    let cardExpirationArray = cardExpiration.split('');
    let billingStreet = req.body.billingStreet;
    let billingCity = req.body.billingCity;
    let billingState = req.body.billingState;
    let billingZip = req.body.billingZip;

    model.addCard(cardType, cardNumber, cardExpirationArray, billingStreet, billingCity, billingState, billingZip, res);

    res.redirect('/usercards.html');
};

exports.deleteCard = (req, res) => {
    let cardId = req.body.id;
    model.deleteCard(cardId, res);
    res.redirect('/userCards.html');
};

exports.getCard = (req, res) => {
    model.getCard(res);
};

exports.forgotPassword = (req, res) => {
    values.setForgotPasswordEmail(req.body.email);
    values.setVerificationCode(Math.floor(100000 + Math.random() * 900000));
    let message = 'Return to the cinema site and enter this code to reset your password: ' + values.getVerificationCode();
    sendEmail(values.getForgotPasswordEmail(), message);

    res.redirect('/resetPassword.html');
};

exports.forgotUpdatePassword = (req, res) => {
  let newPassword = req.body.newPassword;
  let confirmNewPassword = req.body.confirmNewPassword;

  if (req.body.regCode != values.getVerificationCode()) {
      console.log('wrong code');
  }
  else {
      if (newPassword != confirmNewPassword) {
          console.log('passwords dont match');
      }
      else {
          model.forgotUpdatePassword(newPassword, res);
      }
  }
};

exports.getCard = (req, res) => {
    model.getCard(res);
};