const express = require('express');
const router = express.Router();
const db = require('../config/database.js');
const conn = db.init();


//add bookmark
router.post('/add/:user', (req,res) => {
    const data = req.body; // user_code, TB_code
    console.log(data);

    const sql = "Insert into withus.BookMarkTB (User_code, TB_code) values (?,?)";
          const params = [data.User_code, data.TB_code];
          conn.query(sql, params, function (err, rows, fields) {
            if(err) console.log("sql error:", err);
          });

    res.json(data);
});

//delete bookmark
router.post('/delete/:user', (req,res) => {
  const data = req.body; // user_code, TB_code
  console.log(data);

  const sql = "delete from withus.BookMarkTB where User_code = ? and TB_code = ? ;";
        const params = [data.User_code, data.TB_code];
        conn.query(sql, params, function (err, rows, fields) {
          if(err) console.log("sql error:", err);
        });

  res.json(data);
});

//get bookmarkInfo from loginUser
router.get('/:user', (req, res) => {
  const user = req.params.user;

  const sql = 'select TB_code from withus.BookMarkTB where user_code ='+ user;
    conn.query(sql, function (err, rows, fields) {
      if(err) console.log("sql error:", err);
      else {
        res.send(rows);
      }
    });
  });


module.exports = router;