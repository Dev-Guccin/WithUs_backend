var express = require('express');
var router = express.Router();
var db = require('../config/database.js');
var conn = db.init();

/* 관리자페이지 회원 전체 정보 띄워주는 DB쿼리 */
router.get('/user', function(req, res, next) {
  var sql = 'SELECT User_id, User_name, User_nickname, User_phone, User_gender, User_university, User_major, User_area FROM withus.User;';
  conn.query(sql, function (err, rows, fields) {
    if(err) console.log('query is not excuted. select fail...\n' + err);
    else {
      res.send(rows);
    }
  });
});

/* 관리자페이지 공모전 전체 정보 띄워주는 DB쿼리 */
router.get('/admin', function(req, res, next) {
    var sql = 'SELECT CB_code, CB_title, CB_field, CB_link FROM withus.CompeteBoard LIMIT 10;';
    conn.query(sql, function (err, rows, fields) {
      if(err) console.log('query is not excuted. select fail...\n' + err);
      else {
        res.send(rows);
      }
    });
  });

/* 관리자페이지 팀원모집 게시판 전체 정보 띄워주는 DB쿼리 */
router.get('/board', function(req, res, next) {
  var sql = 'SELECT TB_code, User_code, TB_title, TB_recruitNumber, TB_finalNumber, TB_createDate, TB_finalDate, TB_contestOrProject FROM withus.TeamBoard;';
  conn.query(sql, function (err, rows, fields) {
    if(err) console.log('query is not excuted. select fail...\n' + err);
    else {
      res.send(rows);
    }
  });
});

module.exports = router;