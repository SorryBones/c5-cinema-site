const { setCurrentUserID, setLoggedIn, setIsIncorrectPassword } = require("../values.js");
const sql = require("./db.js");
const connection = require("./db.js");
const crypto = require('crypto');

// database encryption
const algorithm = "aes-256-cbc";
const key ="12345678123456781234567812345678";
const iv = "zAvR2NI87bBx746n";
function encrypt(message) {
  const encrypter = crypto.createCipheriv(algorithm, key, iv);
  let encryptedMsg = encrypter.update(message, "utf8", "hex");
  encryptedMsg += encrypter.final("hex");
  return encryptedMsg;
}
function decrypt(encryptedMsg) {
  const decrypter = crypto.createDecipheriv(algorithm, key, iv);
  let decryptedMsg = decrypter.update(encryptedMsg, "hex", "utf8");
  decryptedMsg += decrypter.final("utf8");
  console.log(decryptedMsg)
  return decryptedMsg;
}

exports.login = (email, password, req, res) => {
  connection.query('SELECT * FROM user WHERE email = ? AND password = ?',[email, encrypt(password)],function(error,results,fields){
    if (results.length > 0) {
      console.log('logged in');
      setIsIncorrectPassword(false);
      setLoggedIn(true);
      setCurrentUserID(results[0].user_id);
      res.redirect('/index.html');
    } else {
      console.log('failed to log in');
      setIsIncorrectPassword(true);
      res.redirect('/login.html');
    }
  })
};