var express = require('express');
var router = express.Router();
var db = require('../config/database.js');
var conn = db.init();
const timezoneOffset = new Date().getTimezoneOffset() * 60000;

router.get('/detail/:TB_code', function(req, res, next) {
    //페이지네이션
    var TB_code = parseInt(req.params.TB_code)
    //모든 데이터를 최신순으로 20개만 가져온다.
    var sql = 'SELECT TeamBoard.User_code, TB_code, CT_code, TB_title, TB_recruitNumber, TB_finalNumber, TB_content, TB_createDate, TB_finalDate, TB_contestOrProject, TB_CBcode,User_name, User_nickname, CB_title FROM withus.TeamBoard left join withus.User ON TeamBoard.User_code = User.User_code left join withus.CompeteBoard on TeamBoard.TB_CBcode = CompeteBoard.CB_code  WHERE TB_code='+TB_code+';';
    conn.query(sql, function (err, rows, fields) {
      if(err) console.log('query is not excuted. select fail...\n' + err);
      else {
        rows.map((item) =>{
          item.TB_createDate = new Date(new Date(item.TB_createDate) - timezoneOffset).toJSON().substring(0,10);
          item.TB_finalDate = new Date(new Date(item.TB_finalDate) - timezoneOffset).toJSON().substring(0,10)
        })
        res.send(rows);
      }
    });
  });

router.get('/reply/:TB_code', function(req, res, next) {
    //페이지네이션
    var TB_code = parseInt(req.params.TB_code)
    //모든 데이터를 최신순으로 20개만 가져온다.
    var sql = 'SELECT * FROM withus.TeamBoardReply WHERE TB_code='+TB_code+';';
    conn.query(sql, function (err, rows, fields) {
      if(err) console.log('query is not excuted. select fail...\n' + err);
      else {
        res.send(rows);
      }
    });
  });
  
  module.exports = router;