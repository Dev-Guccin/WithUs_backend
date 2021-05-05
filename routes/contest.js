var express = require('express');
var router = express.Router();
var db = require('../config/database.js');
var conn = db.init();


function calc_end_date(row){
  var now = new Date();
  var date = row.CB_finalDate;
  console.log(now)
  console.log(date)
  var date = date.split(/년|월|일|/);
  //오전 오후 연산
  var a = date[3].split(/:|오전|오후/)
  if(date[3].inclues("오후")){
    tmp.map(function(item){return parseInt(item, 10);})  
  
  }

}
/* GET test + MySQL연동 test!!*/
router.get('/:page', function(req, res, next) {
  //페이지네이션
  var page = (parseInt(req.params.page)-1) * 20;
  //모든 데이터를 최신순으로 20개만 가져온다.
  var sql = 'SELECT CB_code,CB_title,CB_field,CB_organization,CB_finalDate,CB_photo FROM withus.CompeteBoard order by CB_startDate desc limit 20 offset '+page+";";
  conn.query(sql, function (err, rows, fields) {
    if(err) console.log('query is not excuted. select fail...\n' + err);
    else {
      //데이터의 마감 일을 계산한다.
      //console.log(rows)
      //calc_end_date(rows[0]);
      res.send(rows);
    }
  });
});

/* GET test + MySQL연동 test!!*/
router.get('/detail/:CB_code', function(req, res, next) {
  //페이지네이션
  var CB_code = parseInt(req.params.CB_code)
  //모든 데이터를 최신순으로 20개만 가져온다.
  var sql = 'SELECT * FROM withus.CompeteBoard WHERE CB_code='+CB_code+';';
  conn.query(sql, function (err, rows, fields) {
    if(err) console.log('query is not excuted. select fail...\n' + err);
    else {
      res.send(rows);
    }
  });
});


module.exports = router;
