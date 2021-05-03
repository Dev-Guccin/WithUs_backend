var express = require('express');
var router = express.Router();
var db = require('../config/database.js');
var conn = db.init();

/* GET test + MySQL연동 test!!*/
router.get('/', function(req, res, next) {
  //모든 데이터를 최신순으로 20개만 가져온다.
  var sql = 'SELECT CB_title,CB_field,CB_organization,CB_finalDate,CB_photo FROM withus.CompeteBoard order by CB_startDate desc limit 20;';
  conn.query(sql, function (err, rows, fields) {
    if(err) console.log('query is not excuted. select fail...\n' + err);
    else {
      //데이터의 마감 일을 계산한다.
      console.log()
      res.send(rows);
    }
  });
});


module.exports = router;
