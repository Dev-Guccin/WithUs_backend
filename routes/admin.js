var express = require('express');
var router = express.Router();
var db = require('../config/database.js');
var conn = db.init();

/* 관리자페이지 회원 전체 정보 띄워주는 DB쿼리 */
router.get('/user', function(req, res, next) {
  var sql = 'SELECT User_code, User_id, User_name, User_nickname, User_phone, User_gender, User_university, User_major, User_area FROM withus.User;';
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

/* 관리자페이지 회원정보 페이지 띄워주는 DB쿼리 */
router.get('/modify/:User_code', function(req, res, next) {
  var User_code = parseInt(req.params.User_code)
  var sql = 'SELECT * FROM withus.User WHERE User_code='+User_code+';';
  conn.query(sql, function (err, rows, fields) {
    if(err) console.log('query is not excuted. select fail...\n' + err);
    else {
      res.send(rows);
    }
  });
});

/* 공모전삭제 DB 쿼리 */
router.get('/delete/compete/:CB_code', function(req, next) {
  var CB_code = parseInt(req.params.CB_code);
  var sql = 'Delete FROM withus.CompeteBoard WHERE CB_code='+CB_code+';';
  conn.query(sql);
});

/* 팀원모집 게시글 삭제 DB 쿼리 */
router.get('/delete/teammate/:TB_code', function(req, next) {
  var TB_code = parseInt(req.params.TB_code);
  var sql = 'Delete FROM withus.TeamBoard WHERE TB_code='+TB_code+';';
  conn.query(sql);
});


/* 회원정보 수정 업데이트 DB 쿼리 */
router.post('/modify_test/:User_code', function(req, res, next) {
  console.log(req.body);
  var User_code = parseInt(req.params.User_code);
  var sql = 'UPDATE withus.User SET User_id = "'+req.body.User_id+'", User_name = "'+req.body.User_name+'", User_nickname = "'+req.body.User_nickname+'", User_university = "'+req.body.User_university+'", User_gender = "'+req.body.User_gender+'", User_phone = "'+req.body.User_phone+'", User_major = "'+req.body.User_major+'", User_area = "'+req.body.User_area+'" WHERE User_code='+User_code+';';
  conn.query(sql);
  res.send('성공!!!');
});

/* 회원정보 삭제 업데이트 DB 쿼리 */
router.post('/delete/user/:User_code', function(req, res, next) {
  console.log(req.body);
  var User_code = parseInt(req.params.User_code);
  var sql = 'DELETE FROM withus.User WHERE User_code = '+User_code+';';
  conn.query(sql);
  res.send('성공!!!');
});

module.exports = router;