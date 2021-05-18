const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const db = require('../config/database.js');
const {idOVerlap} = require('./Authentication');
const { get } = require('./teamBoard.js');
const conn = db.init();

router.post('/join', idOVerlap ,function(req, res, next) { // 회원가입 라우터

  var Originalpassword = req.body.User_password;

  bcrypt.genSalt(saltRounds, function(err, salt) {
    if(err) return res.status(400).json({SignUp : false, message : "password encoding error"});
    bcrypt.hash(Originalpassword, salt, function(err, hash) {
        if(err) return res.status(400).json({SignUp : false, message : "password encoding error"});
        else {
          var sql = "Insert into User (User_id, User_name, User_university, User_gender, User_phone, User_nickname, User_major, User_area, User_certificate, User_introduction, User_password) values (?,?,?,?,?,?,?,?,?,?,?)";
          var params = [req.body.User_id, req.body.User_name, req.body.User_university, req.body.User_gender, req.body.User_phone, req.body.User_nickname, req.body.User_major, req.body.User_area, req.body.User_certificate, req.body.User_introduction, hash];
          conn.query(sql, params, function (err, rows, fields) {
            if(err) return res.status(400).json({SignUp : false, message : "쿼리 에러"});
            else {
              return res.status(200).json({SignUp : true});
            };
          });
        }
    });
  });
});

router.post('/modify', (req, res, next) => { // 마이페이지 회원정보 변경 (아이디, 이름, 성별은 변경 불가능)
      console.log(req.body);
      var sql = "Update User set User_name = ?, User_phone = ?, User_university = ?, User_nickname = ?, User_area = ?, User_major = ?, User_certificate = ?, User_introduction = ? where User_code = ?";
      var params = [req.body.User_name, req.body.User_phone, req.body.User_university, req.body.User_nickname, req.body.User_area, req.body.User_major, req.body.User_certificate, req.body.User_introduction, req.body.User_code];
      conn.query(sql, params, function (err, rows, fields) {
        if(err) return res.status(400).json({modify : false, message : "modify error!"});
        else {
          var selectrows = "SELECT User_code, User_name, User_university, User_nickname, User_phone, User_major, User_area, User_certificate, User_introduction from User where User_code = ?"
          conn.query(selectrows, req.body.User_code, function (err, rows, fields) {
            if(err) return res.status(400).json({modify : true, select : false, message : "select query error"});
            else {
              return res.status(200).json({modify : true, select : true, message : "modify success", modifyuser : rows[0]});
            };
          });

          // return res.status(400).json({select : false, message : "select query error"});
        };
      });
})

//관심사 추가
router.post('/Interest', (req, res, next) => {
  console.log(req.body);

  var sql = "Insert into Interest (User_code, ScienceEnginnering, ContentsWebtoon, EnvironmentEnergy, Employment, Art, Academic, Idea, UCC, culture, Design, Slogan, Economy) values (?,?,?,?,?,?,?,?,?,?,?,?,?) on duplicate key update ScienceEnginnering = ?, ContentsWebtoon = ?, EnvironmentEnergy = ?, Employment = ?, Art = ?, Academic = ?, Idea = ?, UCC = ?, culture = ?, Design = ?, Slogan = ?, Economy = ?"
  var params = [req.body.User_code, req.body.ScienceEnginnering, req.body.ContentsWebtoon, req.body.EnvironmentEnergy, req.body.Employment, req.body.Art, req.body.Academic, req.body.Idea, req.body.UCC, req.body.culture, req.body.Design, req.body.Slogan, req.body.Economy, req.body.ScienceEnginnering, req.body.ContentsWebtoon, req.body.EnvironmentEnergy, req.body.Employment, req.body.Art, req.body.Academic, req.body.Idea, req.body.UCC, req.body.culture, req.body.Design, req.body.Slogan, req.body.Economy];
  conn.query(sql, params, function (err, rows, fields) {
    if(err) return res.status(200).json({Interest: false,  message : "Interest add error"});
    else {
      return res.status(200).json({Interest : true, message : "Interest add success"});
    };
  });
})

//현재의 관심사 불러오기
router.post('/getCurrentInterest', (req, res, next) => {

  var sql = "select * from Interest where User_code = ?";
  conn.query(sql, req.body.CurrentUserCode, function(err, rows, fields) {
    if(err) res.status(200).json({getData : false, message : "쿼리 오류"});
    else {
      return res.status(200).json({getData : true, CurrentInterest : rows[0]});
    }
  })
})

router.post('/Quit', (req, res, next) => {
  console.log(req.body);

  var getPassword = "select User_password from User where User_code = ?";
  conn.query(getPassword, req.body.User_code, async function(err, rows, fields) {
    if(err) return res.status(400).json({selectPassword : false, message : "query error"});
    else {
      const result = await bcrypt.compare(req.body.User_password, rows[0].User_password);
      if(result) {
        var sql = "delete from User where User_code = ?";
        var params = [req.body.User_code];
        conn.query(sql, params, function(err, rows, fields) {
          if(err) return res.status(400).json({quit : false, message : "query error"});
          else {
            return res.status(200).json({quit : true, message : "quit success"});
          }
        })
      } else {
        return res.status(400).json({quit : false, message : "비밀번호가 틀렸습니다."});
      }
    }
  })
})

router.post('/modifyPassword', (req, res) => {
  var getPassword = "select User_password from User where User_code = ?";
  conn.query(getPassword, req.body.User_code, async function(err, rows, fields) {
    if(err) return res.status(400).json({selectPassword : false, message : "query error"});
    else {
      //User_current_password가 현재 DB비밀번호와 일치하는지 확인
      console.log("여기까지 확인");
      const result = await bcrypt.compare(req.body.User_current_password, rows[0].User_password);
      if(result) {
        //일치한다면 바꾸려고하는 비밀번호(User_password)를 암호화
        bcrypt.genSalt(saltRounds, function(err, salt) {
          if(err) return res.status(400).json({modify : false, message : "비밀번호 암호화 실패"});
          bcrypt.hash(req.body.User_password, salt, function(err, hash) {
            if(err) return res.status(400).json({modify : false, message : "비밀번호 암호화 실패"});
            else {
              var sql = "update User set User_password = ? where User_code = ?";
              var params = [hash, req.body.User_code];
              conn.query(sql, params, function(err, rows, fields) {
                if(err) return res.status(400).json({modify : false, message : "암호화한 코드 삽입 실패"});
                else {
                  return res.status(200).json({modify : true, message : "modify success"});
                }
              })
            }
          })
        })
      } else {
        //아니면 error 출력
        console.log("의심부분");
        return res.status(200).json({modify : false, message : "현재 비밀번호가 틀렸습니다."});
      }
    }
  })
})

//내가 쓴 글 불러오기
router.post('/MyTeamBoard', (req, res, next) => {

  var sql = "select t.TB_code, c.CT_code, c.CT_name, t.TB_recruitnumber, t.TB_finalNumber, t.TB_content, t.TB_createDate, t.TB_finalDate, t.TB_contestOrProject from TeamBoard as t join Category as c on t.CT_code = c.CT_code where t.User_code = ?";
  conn.query(sql, req.body.User_code, (err, rows, field) => {
    if(err) return res.status(400).json({message  : "querry error"});
    else {
      return res.status(200).json({getMyTeamBoard : true, MyTeamBoard : rows});
      // console.log("test", rows);
    }
  })
})
//내가 신청한 목록 확인하기
router.get('/ApplicationList/:user_id', (req, res, next) => {
  var user_id = parseInt(req.params.user_id)
  console.log("user_id:",user_id)
  var sql = `select * from Team_Waiter inner join TeamBoard on TeamBoard.TB_code = Team_Waiter.TB_code where Team_Waiter.waiter_code=${user_id} order by waiter_time desc`;
  conn.query(sql, req.body.User_code, (err, rows, field) => {
    if(err) return res.status(400).json({message  : "querry error"});
    else {
      //return res.status(200).json({getMyTeamBoard : true, MyTeamBoard : rows});
       console.log("test", rows);
       res.status(200).json(rows);
    }
  })
})
//내 프로젝트에 신청한 목록 확인
router.get('/ApplicationCheck/:user_id', (req, res, next) => {
  var user_id = parseInt(req.params.user_id)
  console.log("user_id:",user_id)
  var sql = `select Team_Waiter.TB_code,TB_title,TB_contestOrProject,waiter_code,waiter_time,TeamBoard.CT_code,waiter_enter,user_name,TB_recruitNumber,TB_finalNumber from Team_Waiter join User on User.user_code = Team_Waiter.waiter_code join TeamBoard on TeamBoard.user_code = Team_Waiter.User_code where Team_Waiter.User_code=${user_id} order by waiter_time desc;`;
  conn.query(sql, req.body.User_code, (err, rows, field) => {
    if(err) return res.status(400).json({message  : "querry error"});
    else {
      //return res.status(200).json({getMyTeamBoard : true, MyTeamBoard : rows});
       console.log("test", rows);
       res.status(200).json(rows);
    }
  })
})
//내 프로젝트에 신청한 사람 변경
router.post('/ApplicationCheck/', (req, res, next) => {
  console.log("check body:",req.body)
  var sql = `update * from Team_waiter`;
  conn.query(sql, req.body.User_code, (err, rows, field) => {
    if(err) return res.status(400).json({message  : "querry error"});
    else {
      //return res.status(200).json({getMyTeamBoard : true, MyTeamBoard : rows});
       console.log("test", rows);
       res.status(200).json(rows);
    }
  })
})
module.exports = router;