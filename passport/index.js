const passport = require('passport');
const local = require('./localStrategy');
var db = require('../config/database.js');
var conn = db.init();

module.exports = () => {
passport.serializeUser(function(user, done) {
    //로그인했을 때 딱 한번 호출
    done(null, user.User_code);
  });
  
  passport.deserializeUser(function(id, done) {
    //serializeUser에서 넘겨준 값을 받아서 그 값을 사용할때마다 호출
    console.log("Hello World", id);
    var sql = 'SELECT * FROM User where User_code = ?';
    conn.query(sql, id, function (err, rows, fields) {
      if(err) console.log('query is not excuted. select fail...\n' + err);
      else {
        done(null, rows[0]);
      }
    });
  });

  local();
}