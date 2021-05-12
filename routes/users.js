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
          var sql = "Insert into User (User_id, User_name, User_university, User_gender, User_phone, User_nickname, User_major, User_area, User_certificate, User_introduction, User_password) values (?,?,?,?,?,?,?,?,?)";
          var params = [req.body.User_id, req.body.User_name, req.body.User_university, req.body.User_gender, req.body.User_phone, req.body.User_nickname, req.body.User_major, req.body.User_area, req.body.User_certificate, req.body.User_introduction, hash];
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

router.post('/modify', (req, res, next) => { // 마이페이지 회원정보 변경 (아이디, 이름, 성별은 변경 불가능)
      console.log(req.body);
      var sql = "Update User set User_name = ?, User_phone = ?, User_university = ?, User_nickname = ?, User_area = ?, User_major = ?, User_certificate = ?, User_introduction = ? where User_code = ?";
      var params = [req.body.User_name, req.body.User_phone, req.body.User_university, req.body.User_nickname, req.body.User_area, req.body.User_major, req.body.User_certificate, req.body.User_introduction, req.body.User_code];
      conn.query(sql, params, function (err, rows, fields) {
        if(err) return res.status(400).json({modify : false, message : "modify error!"});
        else {
          var selectrows = "SELECT User_code, User_name, User_university, User_nickname, User_phone, User_major, User_area, User_certificate, User_introduction from User where User_code = ?"
          conn.query(selectrows, req.body.User_code, function (err, rows, fields) {
            if(err) return res.status(400).json({modify : true, select : false, message : "select query error"});
            else {
              return res.status(200).json({modify : true, select : true, message : "modify success", modifyuser : rows[0]});
            };
          });

          // return res.status(400).json({select : false, message : "select query error"});
        };
      });
})

module.exports = router;