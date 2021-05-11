const express = require('express');
const router = express.Router();
const db = require('../config/database.js');
const conn = db.init();


router.post('/', (req,res) => {
    const teamBoardData = req.body;
    console.log(teamBoardData);

    const sql = "Insert into withus.TeamBoard (User_code, CT_code, TB_title,TB_recruitNumber, TB_finalNumber, TB_content, TB_createDate,TB_finalDate,TB_contestOrProject) values (?,?,?,default,?,?,default,?,?)";
          const params = [teamBoardData.User_code, teamBoardData.CT_code, teamBoardData.TB_title, teamBoardData.TB_finalNumber, teamBoardData.TB_content, teamBoardData.TB_finalDate, teamBoardData.TB_contestOrProject];
          conn.query(sql, params, function (err, rows, fields) {
            if(err) console.log("sql error:", err);
          });

    res.json(teamBoardData);
});

router.get('/', (req, res) => {

    const sql = 'select TeamBoard.CT_code, TeamBoard.User_code, TeamBoard.TB_title, User.User_nickname, TeamBoard.TB_content,Category.CT_name, TeamBoard.TB_recruitNumber, TeamBoard.TB_finalNumber, TeamBoard.TB_createDate, TeamBoard.TB_finalDate, TeamBoard.TB_contestOrProject from withus.TeamBoard left join withus.User ON TeamBoard.User_code = User.User_code left join withus.Category on TeamBoard.CT_code = Category.CT_code order by TeamBoard.TB_createDate desc';
    conn.query(sql, function (err, rows, fields) {
      if(err) console.log("sql error:", err);
      else {
        res.send(rows);
      }
    });
  });


module.exports = router;