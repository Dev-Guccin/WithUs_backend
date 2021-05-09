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

const fieldname = ["환경/에너지","콘텐츠/웹툰","취업/창업","음악/예술","연구/학술/논문","아이디어/기획",
"사진/영상/UCC","문화/영화/문학","디자인/미술","네이밍/슬로건","금융/경제/경영","과학/공학/IT"]
const targetname=["누구나지원", "청소년","대학(원)생", "취준생", "직장인"]

router.post('/options/:page', function(req, res, next) {
  var data = req.body.data
  console.log(data)
  //필드의 값을 확인하여 db query를 만든다.
  fieldlist =[]
  fieldstring=""
  for (let i = 0; i < fieldname.length; i++) {
    if(data.field[i] == true){
      fieldlist.push("'"+fieldname[i]+"'")
      console.log(fieldname[i])
    }
  }
  if(fieldlist.length != 0){
    fieldstring = "CB_field in ("+ fieldlist.join(",") + ")"
  }
  console.log("field:",fieldstring)
  // 타켓의 값을 확인하여 db query를 만든다.
  targetlist =[]
  targetstring = ""
  for (let i = 0; i < targetname.length; i++) {
    if(data.target[i] == true){
      targetlist.push(targetname[i])
    }
  }
  if(targetlist.length != 0){
    targetstring = "CB_target REGEXP '"+ targetlist.join("|") + "'"
  }
  console.log("target:",targetstring)
  // 키워드의 값을 확인하여 db query를 만든다.
  keywordlist = data.keyword.replace(/ /,"").split("#").slice(1)
  keywordstring = ""
  if(keywordlist.length != 0){
    keywordstring = "CB_title REGEXP '"+keywordlist.join("|")+"'"
  }
  console.log("keyword:",keywordstring)

  //DB쿼리를 날린다.
  var page = (parseInt(req.params.page)-1) * 20;
  var sql = `SELECT CB_code,CB_title,CB_field,CB_organization,CB_finalDate,CB_photo FROM withus.CompeteBoard `
  +`${(fieldstring.length > 0 || targetstring.length > 0 || keywordstring.length > 0)? "where ":""}`
  +`${fieldstring}`
  +`${(fieldstring.length > 0 && targetstring.length > 0 )? "and "+targetstring : targetstring}`
  +`${(targetstring.length > 0 && keywordstring.legnth > 0)? "and "+keywordstring : keywordstring }`
  +`order by CB_startDate desc limit 20 offset ${page};`;
  console.log("sql :",  sql)
  conn.query(sql, function (err, rows, fields) {
    if(err) console.log('query is not excuted. select fail...\n' + err);
    else {
      console.log(rows)
      res.send(rows);
    }
  });
});

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
