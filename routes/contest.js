var express = require('express');
var router = express.Router();
var db = require('../config/database.js');
var conn = db.init();

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
  console.log("field:",fieldstring,"/fieldnum:",fieldstring.length)
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
  console.log("target:",targetstring,"/targetnum:",targetstring.length)
  // 키워드의 값을 확인하여 db query를 만든다.
  keywordlist = data.keyword.replace(/ /,"").split("#").slice(1)
  keywordstring = ""
  if(keywordlist.length != 0){
    keywordstring = "CB_title REGEXP '"+keywordlist.join("|")+"'"
  }
  console.log("keyword:",keywordstring,"/keywordnum:",keywordstring.length)
  console.log((fieldstring.length > 0 || targetstring.length > 0))
  console.log(keywordstring.length > 0)

  // 정렬방식을 확인하여 db query를 만든다.
  sort = data.sort
  console.log("sort방식:", typeof(sort))
  //1->최신순, 2->시작 가까운순 3->마감날짜순 4->마감 가까운순
  sortstring=""
  if(sort == 1){
    sortstring="order by CB_startDate desc"
  }
  else if(sort == 2){
    sortstring="order by ABS(DATEDIFF(NOW(), `CB_startDate`))"
  }
  else if(sort == 3){
    sortstring="order by CB_finalDate desc"
  }
  else if(sort == 4){
    sortstring="order by ABS(DATEDIFF(NOW(), `CB_finalDate`))"
  }

  //DB쿼리를 날린다.
  var page = (parseInt(req.params.page)-1) * 20;
  var sql = `SELECT CB_code,CB_title,CB_field,CB_organization,CB_startDate,CB_finalDate,CB_photo,CB_count FROM withus.CompeteBoard `
  +`${(fieldstring.length > 0 || targetstring.length > 0 || keywordstring.length > 0)? "where ":""}`
  +`${fieldstring}`
  +`${(fieldstring.length > 0 && targetstring.length > 0 )? "and "+targetstring : targetstring}`
  +`${((fieldstring.length > 0 || targetstring.length > 0) && keywordstring.length > 0)? "and "+keywordstring : keywordstring }`
  +`${sortstring} limit 20 offset ${page};`;
  console.log("sql :",  sql)
  conn.query(sql, function (err, rows, fields) {
    if(err) console.log('query is not excuted. select fail...\n' + err);
    else {
      // 여기서 개수 구해야함.
      console.log(rows)
      // 해당 조건의 개수를 구하기
      var sql = `SELECT COUNT(*) FROM withus.CompeteBoard `
      +`${(fieldstring.length > 0 || targetstring.length > 0 || keywordstring.length > 0)? "where ":""}`
      +`${fieldstring}`
      +`${(fieldstring.length > 0 && targetstring.length > 0 )? "and "+targetstring : targetstring}`
      +`${((fieldstring.length > 0 || targetstring.length > 0) && keywordstring.length > 0)? "and "+keywordstring : keywordstring }`
      +`;`;
      console.log(sql)
      conn.query(sql, rows, function (err, numrows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else{
          console.log(rows)
          console.log(numrows)
          rows.push({"count":numrows[0]["COUNT(*)"]})
          console.log(rows)
          res.send(rows);
        }
      })
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
