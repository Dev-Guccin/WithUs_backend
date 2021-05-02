var express = require('express');
var router = express.Router();
var db = require('../config/database.js');
var conn = db.init();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET test + MySQL연동 test!!*/
router.get('/fieldList', function(req, res, next) {
  var sql = 'SELECT distinct CB_field FROM CompeteBoard';
  conn.query(sql, function (err, rows, fields) {
    if(err) console.log('query is not excuted. select fail...\n' + err);
    else res.send(rows);
  });
});


module.exports = router;
