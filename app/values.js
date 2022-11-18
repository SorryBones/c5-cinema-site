let loggedIn = false;
let getLoggedIn = function() {
    return loggedIn;
}
let setLoggedIn = function(input) {
    loggedIn = input;
}

let adminUserProfileId;
let getAdminUserProfileId = function() {
    return adminUserProfileId;
}
let setAdminUserProfileId = function(input) {
    adminUserProfileId = input;
}

let movieId;
let getMovieId = function() {
    return movieId;
}
let setMovieId = function(input) {
    movieId = input;
}

let currentUserID = -1;
let getCurrentUserID = function() {
    return currentUserID;
}
let setCurrentUserID = function(input) {
    currentUserID = input;
}

let verificationCode;
let getVerificationCode = function() {
    return currentUserID;
}
let setVerificationCode = function(input) {
    currentUserID = input;
}

let registerBody;
let getRegisterBody = function() {
    return registerBody;
}
let setRegisterBody = function(input) {
    registerBody = input;
}

let forgotPasswordEmail;
let getForgotPasswordEmail = function() {
    return forgotPasswordEmail;
}
let setForgotPasswordEmail = function(input) {
    forgotPasswordEmail = input;
}

let isIncorrectPassword = false;
let getIsIncorrectPassword = function() {
    return isIncorrectPassword;
}
let setIsIncorrectPassword = function(input) {
    isIncorrectPassword = input;
}

let isIncorrectShowtime = false;
let getIsIncorrectShowtime = function() {
    return isIncorrectShowtime;
}
let setIsIncorrectShowtime = function(input) {
    isIncorrectShowtime = input;
}

let isInvalidMovie = false;
let getIsInvalidMovie = function() {
    return isInvalidMovie;
}
let setIsInvalidMovie = function(input) {
    isInvalidMovie = input;
}

let promoHeader;
let getPromoHeader = function() {
    return promoHeader;
}
let setPromoHeader = function(input) {
    promoHeader = input;
}

let promoBody;
let getPromoBody = function() {
    return promoBody;
}
let setPromoBody = function(input) {
    promoBody = input;
}

let promoDiscount;
let getPromoDiscount = function() {
    return promoDiscount;
}
let setPromoDiscount = function(input) {
    promoDiscount = input;
}

let promoId;
let getPromoId = function() {
    return promoId;
}
let setPromoId = function(input) {
    promoId = input;
}

module.exports = {
    getLoggedIn, setLoggedIn,
    getAdminUserProfileId, setAdminUserProfileId,
    getMovieId, setMovieId,
    getCurrentUserID, setCurrentUserID,
    getVerificationCode, setVerificationCode,
    getRegisterBody, setRegisterBody,
    getForgotPasswordEmail, setForgotPasswordEmail,
    getIsIncorrectPassword, setIsIncorrectPassword,
    getIsIncorrectShowtime, setIsIncorrectShowtime,
    getIsInvalidMovie, setIsInvalidMovie,
    getPromoHeader, setPromoHeader,
    getPromoBody, setPromoBody,
    getPromoDiscount, setPromoDiscount,
    getPromoId, setPromoId
};