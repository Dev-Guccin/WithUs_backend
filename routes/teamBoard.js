const express = require('express');
const router = express.Router();
const db = require('../config/database.js');
const conn = db.init();
const jsdom = require("jsdom");
const { JSDOM } = jsdom;


const timezoneOffset = new Date().getTimezoneOffset() * 60000; 

function stripHtml(html){

  const dom = new JSDOM(`<!DOCTYPE html><div></div>`);
  dom.window.document.querySelector("div").innerHTML = html

  return dom.window.document.querySelector("div").textContent || dom.window.document.querySelector("div").innerText;

}


//create teamBoard
router.post('/', (req,res) => {
    const teamBoardData = req.body;
    console.log(teamBoardData);

    const sql = "Insert into withus.TeamBoard (User_code, CT_code, TB_title,TB_recruitNumber, TB_finalNumber, TB_content, TB_createDate,TB_finalDate,TB_contestOrProject, TB_CBcode) values (?,?,?,default,?,?,default,?,?,?)";
    const params = [teamBoardData.User_code, teamBoardData.CT_code, teamBoardData.TB_title, teamBoardData.TB_finalNumber, teamBoardData.TB_content, teamBoardData.TB_finalDate, teamBoardData.TB_contestOrProject, teamBoardData.TB_CBcode];
    conn.query(sql, params, function (err, rows, fields) {
        if(err) console.log("sql error:", err);
        else{
            res.send(teamBoardData);
          }
          });
});

//delete teamBoard
router.post('/delete/:TBcode', (req,res) => {
  const TB_code = req.body.TB_code;
  console.log("data",TB_code);

  const sql = "delete from withus.TeamBoard where TB_code =" + TB_code;
  conn.query(sql, function (err, rows, fields) {
      if(err) console.log("sql error:", err);
      else{
        res.send(rows);
        }
        });
})

//update teamBoard
router.post('/update', (req,res) => {
  const teamBoardData = req.body;
  console.log("data",teamBoardData);

  const sql = "update withus.TeamBoard set CT_code = ?, TB_title = ?, TB_finalNumber = ?, TB_content = ?, TB_finalDate =?, TB_contestOrProject = ?, TB_CBcode = ? where TB_code = ?;"
  const params = [teamBoardData.CT_code, teamBoardData.TB_title, teamBoardData.TB_finalNumber, teamBoardData.TB_content, teamBoardData.TB_finalDate,teamBoardData.TB_contestOrProject,teamBoardData.TB_CBcode,teamBoardData.TB_code];
  conn.query(sql,params, function (err, rows, fields) {
    if(err) console.log("sql error:", err);
    else{
      res.send(teamBoardData);
      }
        });


})
router.get('/', (req, res) => {

    const sql = 'select TeamBoard.TB_code, TeamBoard.CT_code, TeamBoard.User_code, TeamBoard.TB_title, User.User_nickname, TeamBoard.TB_content,Category.CT_name, TeamBoard.TB_recruitNumber, TeamBoard.TB_finalNumber, TeamBoard.TB_createDate, TeamBoard.TB_finalDate, TeamBoard.TB_contestOrProject from withus.TeamBoard left join withus.User ON TeamBoard.User_code = User.User_code left join withus.Category on TeamBoard.CT_code = Category.CT_code order by TeamBoard.TB_createDate desc';
    conn.query(sql, function (err, rows, fields) {
      if(err) console.log("sql error:", err);
      else {
        rows.map((item) =>{
          item.TB_content = stripHtml(item.TB_content).substring(0,57);
          item.TB_createDate = new Date(new Date(item.TB_createDate) - timezoneOffset).toJSON().substring(0,10);
          item.TB_finalDate = new Date(new Date(item.TB_finalDate) - timezoneOffset).toJSON().substring(0,10)
        })
        res.send(rows);
      }
    });
  });

// apply team
router.post('/apply', (req,res) => {
  const applyInfo = req.body;
  console.log(applyInfo);

  if(!applyInfo.reApply){ // 최초지원
    const sql = "Insert into withus.Team_Waiter (waiter_code, TB_code, User_code, CT_code, waiter_content,waiter_enter, waiter_nickname, waiter_time) values (?,?,?,?,?,default,?,default)";
    const params = [applyInfo.waiter_code, applyInfo.TB_code,applyInfo.User_code,applyInfo.CT_code, applyInfo.waiter_content, applyInfo.waiter_nickname];
    conn.query(sql, params, function (err, rows, fields) {
      if(err) console.log("sql error:", err);
      else{
          res.send(applyInfo);
        }
        });

  }else{ // 재지원
    const sql = "Update  withus.Team_Waiter set waiter_content = ?, waiter_enter = 0,  waiter_nickname = ?, waiter_time = now() where waiter_code = ? and TB_code = ?";
    const params = [applyInfo.waiter_content, applyInfo.waiter_nickname,applyInfo.waiter_code,applyInfo.TB_code];
    conn.query(sql, params, function (err, rows, fields) {
      if(err) console.log("sql error:", err);
      else{
          res.send(applyInfo);
        }
        });
  }
});

router.get('/applyinfo', (req, res) => {
  const TB_code = req.query.TB_code;
  const waiter_code = req.query.waiter_code;
  console.log(req.query);

  const sql = `select waiter_enter from withus.Team_Waiter where TB_code = ${TB_code} and waiter_code = ${waiter_code}`;
  conn.query(sql, function (err, rows, fields) {
    if(err) console.log("sql error:", err);
    else {
      res.send(rows);
      console.log("get applyInfo success!");
    }
  });
});

router.get('/contestinfo', (req, res) => {
  const sql = 'select CB_code, CB_title, CB_field, CB_photo, CB_startDate, CB_finalDate, CB_organization from withus.CompeteBoard order by CB_startDate desc';

  conn.query(sql, function (err, rows, fields) {
    if(err) console.log("sql error:", err);
    else {
      rows.map((item)=>{
        item.CB_startDate = new Date(new Date(item.CB_startDate) - timezoneOffset).toJSON().substring(0,10);
        item.CB_finalDate = new Date(new Date(item.CB_finalDate) - timezoneOffset).toJSON().substring(0,10);
      })
      res.send(rows);
      console.log("get contestInfo success!");
    }
  });
});




module.exports = router;