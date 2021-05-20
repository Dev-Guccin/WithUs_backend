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

/* 관리자 회원수정 페이지에서 해당 회원정보 띄워주는 DB쿼리 */
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

/* 회원정보 수정 업데이트 DB 쿼리 */
router.post('/modify_test/:User_code', function(req, res, next) {
  console.log(req.body);
  var User_code = parseInt(req.params.User_code);
  var sql = 'UPDATE withus.User SET User_id = "'+req.body.User_id+'", User_name = "'+req.body.User_name+'", User_nickname = "'+req.body.User_nickname+'", User_university = "'+req.body.User_university+'", User_gender = "'+req.body.User_gender+'", User_phone = "'+req.body.User_phone+'", User_major = "'+req.body.User_major+'", User_area = "'+req.body.User_area+'" WHERE User_code='+User_code+';';
  conn.query(sql);
  res.send('성공!!!');
});

/* 회원정보 삭제 DB 쿼리 */
router.post('/delete/user/:User_code', function(req, res, next) {
  console.log(typeof(req.body.User_code));
  console.log(typeof(req.params.User_code));
  var User_code = req.body.User_code;
  var sql = 'DELETE FROM withus.User WHERE User_code = '+User_code+';';
  conn.query(sql);
  res.send('성공!!!');
});

/* 공모전 삭제 DB 쿼리 */
router.post('/delete/compete/:CB_code', function(req, res, next) {
  console.log(req.body.CB_code);
  var CB_code = req.body.CB_code;
  var sql = 'Delete FROM withus.CompeteBoard WHERE CB_code='+CB_code+';';
  conn.query(sql);
  res.send('성공!!!');
});

/* 팀원모집 게시글 삭제 DB 쿼리 */
router.post('/delete/teammate/:TB_code', function(req, res, next) {
  console.log(req.body.CB_code);
  var TB_code = req.body.TB_code;
  var sql = 'Delete FROM withus.TeamBoard WHERE TB_code='+TB_code+';';
  conn.query(sql);
  res.send('성공!!!');
});

/* 회원 검색 DB 쿼리 */
router.post('/search/user', function(req, res, next) {
  console.log(req.body.User_search);
  console.log(typeof(req.body.User_search));
  var Search_code = "'%"+req.body.User_search+"%'";
  var sql = 'SELECT * FROM withus.User WHERE User_id LIKE '+Search_code+' OR User_name LIKE '+Search_code+' OR User_nickname LIKE '+Search_code+';';
  console.log(sql);
  conn.query(sql, function (err, rows) {
    if(err) console.log('query is not excuted. select fail...\n' + err);
    else {
      console.log(rows); 
      res.send(rows);
    }
  });
});

/* 공모전 검색 DB 쿼리 */
router.post('/search/compete', function(req, res, next) {
  console.log(req.body.Compete_search);
  console.log(typeof(req.body.Compete_search));
  var Search_code = "'%"+req.body.Compete_search+"%'";
  var sql = 'SELECT * FROM withus.CompeteBoard WHERE CB_title LIKE '+Search_code+' OR CB_content LIKE '+Search_code+' LIMIT 10;';
  console.log(sql);
  conn.query(sql, function (err, rows) {
    if(err) console.log('query is not excuted. select fail...\n' + err);
    else {
      console.log(rows); 
      res.send(rows);
    }
  });
});

/* 팀원모집 게시판 검색 DB 쿼리 */
router.post('/search/teammate', function(req, res, next) {
  console.log(req.body.Teammate_search);
  console.log(typeof(req.body.Teammate_search));
  var Search_code = "'%"+req.body.Teammate_search+"%'";
  var sql = 'SELECT * FROM withus.TeamBoard WHERE TB_title LIKE '+Search_code+' OR TB_content LIKE '+Search_code+';';
  console.log(sql);
  conn.query(sql, function (err, rows) {
    if(err) console.log('query is not excuted. select fail...\n' + err);
    else {
      console.log(rows); 
      res.send(rows);
    }
  });
});

module.exports = router;