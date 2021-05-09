const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const db = require('../config/database.js');
const conn = db.init();

router.post('/join', function(req, res, next) { // 회원가입 라우터

  var Originalpassword = req.body.User_password;

  bcrypt.genSalt(saltRounds, function(err, salt) {
    if(err) return res.status(400).json({SignUp : false, message : "password encoding error"});
    bcrypt.hash(Originalpassword, salt, function(err, hash) {
        if(err) return res.status(400).json({SignUp : false, message : "password encoding error"});
        else {
          var sql = "Insert into User (User_id, User_name, User_university, User_gender, User_phone, User_nickname, User_major, User_area, User_password) values (?,?,?,?,?,?,?,?,?)";
          var params = [req.body.User_id, req.body.User_name, req.body.User_university, req.body.User_gender, req.body.User_phone, req.body.User_nickname, req.body.User_major, req.body.User_area, hash];
          conn.query(sql, params, function (err, rows, fields) {
            if(err) return res.status(400).json({SignUp : false});
            else {
              return res.status(200).json({SignUp : true});
            };
          });
        }
    });
  });
});

module.exports = router;