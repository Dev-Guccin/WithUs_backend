const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
var db = require('../config/database.js');
var conn = db.init();

module.exports = () => {
    passport.use(new LocalStrategy({

        usernameField: 'User_id',
        passwordField: 'User_password'
        },
    
        function(username, password, done) {
        console.log(username, password);
        
        var sql = 'SELECT * from User where User_id = ?';
        conn.query(sql, username, async function (err, rows, fields) {
            if(err) return res.status(400).json({message : "query error"});
            else  {
            if(rows.length != 0) { // rows가 있다 == 아이디는 맞았다
                console.log("아이디 맞음");
                const result = await bcrypt.compare(password, rows[0].User_password);
                if(result) { // 아이디 비밀번호 둘다 맞았다.
                console.log("아이디 비밀번호 맞음");
                return done(null, rows[0]);
                } else { // 아이디 맞고 비밀번호 틀렸다.
                console.log("아이디 맞고 비밀번호 틀림");
                return done(null, false, { message: 'Incorrect password.' });
                }
            } else { // rows가 없다 == 아이디도 틀렸다
                console.log("아이디 틀림");
                return done(null, false, { message: 'Incorrect username.' });
            }
            }
        });
        }
    ));
}