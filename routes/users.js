const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const db = require('../config/database.js');
const { idOVerlap } = require('./Authentication');
const { get } = require('./teamBoard.js');
const conn = db.init();
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

function stripHtml(html){

  const dom = new JSDOM(`<!DOCTYPE html><div></div>`);
  dom.window.document.querySelector("div").innerHTML = html

  return dom.window.document.querySelector("div").textContent || dom.window.document.querySelector("div").innerText;

}

function stripTime(time){

  const timezoneOffset = new Date().getTimezoneOffset() * 60000;
  const monthDay = new Date(new Date(time) - timezoneOffset).toJSON().split("T")[0].substring(0,10);
  const HourMinute = new Date(new Date(time) - timezoneOffset).toJSON().split("T")[1].substring(0,5);
  
  return monthDay + " " + HourMinute;
}

router.post('/join', idOVerlap, function (req, res, next) { // 회원가입 라우터

  var Originalpassword = req.body.User_password;

  bcrypt.genSalt(saltRounds, function (err, salt) {
    if (err) return res.status(400).json({ SignUp: false, message: "password encoding error" });
    bcrypt.hash(Originalpassword, salt, function (err, hash) {
      if (err) return res.status(400).json({ SignUp: false, message: "password encoding error" });
      else {
        var sql = "Insert into User (User_id, User_name, User_university, User_gender, User_phone, User_nickname, User_major, User_area, User_certificate, User_introduction, User_password) values (?,?,?,?,?,?,?,?,?,?,?)";
        var params = [req.body.User_id, req.body.User_name, req.body.User_university, req.body.User_gender, req.body.User_phone, req.body.User_nickname, req.body.User_major, req.body.User_area, req.body.User_certificate, req.body.User_introduction, hash];
        conn.query(sql, params, function (err, rows, fields) {
          if (err) return res.status(400).json({ SignUp: false, message: "쿼리 에러" });
          else {
            return res.status(200).json({ SignUp: true });
          };
        });
      }
    });
  });
});

router.post('/modify', (req, res, next) => { // 마이페이지 회원정보 변경 (아이디, 이름, 성별은 변경 불가능)
  console.log("마이페이지수정", req.user);
  var sql = "Update User set User_name = ?, User_phone = ?, User_university = ?, User_nickname = ?, User_area = ?, User_major = ?, User_certificate = ?, User_introduction = ? where User_code = ?";
  var params = [req.body.User_name, req.body.User_phone, req.body.User_university, req.body.User_nickname, req.body.User_area, req.body.User_major, req.body.User_certificate, req.body.User_introduction, req.body.User_code];
  conn.query(sql, params, function (err, rows, fields) {
    if (err) return res.status(400).json({ modify: false, message: "modify error!" });
    else {
      var selectrows = "SELECT User_code, User_name, User_university, User_nickname, User_phone, User_major, User_area, User_certificate, User_introduction from User where User_code = ?"
      conn.query(selectrows, req.body.User_code, function (err, rows, fields) {
        if (err) return res.status(400).json({ modify: true, select: false, message: "select query error" });
        else {
          return res.status(200).json({ modify: true, select: true, message: "modify success", modifyuser: rows[0] });
        };
      });

      // return res.status(400).json({select : false, message : "select query error"});
    };
  });
})

//관심사 추가
router.post('/Interest', (req, res, next) => {
  console.log("관심사 추가", req.user);

  var sql = "Insert into Interest (User_code, ScienceEnginnering, ContentsWebtoon, EnvironmentEnergy, Employment, Art, Academic, Idea, UCC, culture, Design, Slogan, Economy) values (?,?,?,?,?,?,?,?,?,?,?,?,?) on duplicate key update ScienceEnginnering = ?, ContentsWebtoon = ?, EnvironmentEnergy = ?, Employment = ?, Art = ?, Academic = ?, Idea = ?, UCC = ?, culture = ?, Design = ?, Slogan = ?, Economy = ?"
  var params = [req.body.User_code, req.body.ScienceEnginnering, req.body.ContentsWebtoon, req.body.EnvironmentEnergy, req.body.Employment, req.body.Art, req.body.Academic, req.body.Idea, req.body.UCC, req.body.culture, req.body.Design, req.body.Slogan, req.body.Economy, req.body.ScienceEnginnering, req.body.ContentsWebtoon, req.body.EnvironmentEnergy, req.body.Employment, req.body.Art, req.body.Academic, req.body.Idea, req.body.UCC, req.body.culture, req.body.Design, req.body.Slogan, req.body.Economy];
  conn.query(sql, params, function (err, rows, fields) {
    if (err) return res.status(200).json({ Interest: false, message: "Interest add error" });
    else {
      return res.status(200).json({ Interest: true, message: "Interest add success" });
    };
  });
})

//현재의 관심사 불러오기
router.post('/getCurrentInterest', (req, res, next) => {

  var sql = "select * from Interest where User_code = ?";
  conn.query(sql, req.body.CurrentUserCode, function (err, rows, fields) {
    if (err) res.status(200).json({ getData: false, message: "쿼리 오류" });
    else {
      return res.status(200).json({ getData: true, CurrentInterest: rows[0] });
    }
  })
})

router.post('/Quit', (req, res, next) => {
  console.log("회원탈퇴", req.user);

  var getPassword = "select User_password from User where User_code = ?";
  conn.query(getPassword, req.body.User_code, async function (err, rows, fields) {
    if (err) return res.status(400).json({ selectPassword: false, message: "query error" });
    else {
      const result = await bcrypt.compare(req.body.User_password, rows[0].User_password);
      if (result) {
        var sql = "delete from User where User_code = ?";
        var params = [req.body.User_code];
        conn.query(sql, params, function (err, rows, fields) {
          if (err) return res.status(400).json({ quit: false, message: "query error" });
          else {
            return res.status(200).json({ quit: true, message: "quit success" });
          }
        })
      } else {
        return res.status(400).json({ quit: false, message: "비밀번호가 틀렸습니다." });
      }
    }
  })
})

router.post('/modifyPassword', (req, res) => {
  console.log("비밀번호수정", req.user);
  var getPassword = "select User_password from User where User_code = ?";
  conn.query(getPassword, req.body.User_code, async function (err, rows, fields) {
    if (err) return res.status(400).json({ selectPassword: false, message: "query error" });
    else {
      //User_current_password가 현재 DB비밀번호와 일치하는지 확인
      console.log("여기까지 확인");
      const result = await bcrypt.compare(req.body.User_current_password, rows[0].User_password);
      if (result) {
        //일치한다면 바꾸려고하는 비밀번호(User_password)를 암호화
        bcrypt.genSalt(saltRounds, function (err, salt) {
          if (err) return res.status(400).json({ modify: false, message: "비밀번호 암호화 실패" });
          bcrypt.hash(req.body.User_password, salt, function (err, hash) {
            if (err) return res.status(400).json({ modify: false, message: "비밀번호 암호화 실패" });
            else {
              var sql = "update User set User_password = ? where User_code = ?";
              var params = [hash, req.body.User_code];
              conn.query(sql, params, function (err, rows, fields) {
                if (err) return res.status(400).json({ modify: false, message: "암호화한 코드 삽입 실패" });
                else {
                  return res.status(200).json({ modify: true, message: "modify success" });
                }
              })
            }
          })
        })
      } else {
        //아니면 error 출력
        console.log("의심부분");
        return res.status(200).json({ modify: false, message: "현재 비밀번호가 틀렸습니다." });
      }
    }
  })
})

//내가 쓴 글 불러오기
router.post('/MyTeamBoard', (req, res, next) => {

  console.log("내가쓴글", req.user);

  var sql = "select t.TB_code, c.CT_code, c.CT_name, t.TB_recruitnumber, t.TB_finalNumber, t.TB_content, t.TB_createDate, t.TB_finalDate, t.TB_contestOrProject from TeamBoard as t join Category as c on t.CT_code = c.CT_code where t.User_code = ?";
  conn.query(sql, req.body.User_code, (err, rows, field) => {
    if (err) return res.status(400).json({ message: "querry error" });
    else {
        rows.map((item) =>{
        item.TB_content = stripHtml(item.TB_content).substring(0,57);})
      return res.status(200).json({ getMyTeamBoard: true, MyTeamBoard: rows });
      // console.log("test", rows);
    }
  })
})
//내가 신청한 목록 확인하기
router.get('/ApplicationList/:user_id', (req, res, next) => {
  console.log("신청목록", req.user);
  var user_id = parseInt(req.params.user_id)
  console.log("user_id:", user_id)
  var sql = `select * from Team_Waiter inner join TeamBoard on TeamBoard.TB_code = Team_Waiter.TB_code where Team_Waiter.waiter_code=${user_id} order by waiter_time desc`;
  conn.query(sql, req.body.User_code, (err, rows, field) => {
    if (err) return res.status(400).json({ message: "querry error" });
    else {
      //return res.status(200).json({getMyTeamBoard : true, MyTeamBoard : rows});
      rows.map((item)=>{
        item.waiter_time = stripTime(item.waiter_time)
      })
      console.log("test", rows);
      res.status(200).json(rows);
    }
  })
})
//내 프로젝트에 신청한 목록 확인
router.get('/ApplicantsCheck/:user_id', (req, res, next) => {
  console.log("신청한사람목록", req.user);
  var user_id = parseInt(req.params.user_id)
  console.log("user_id:", user_id)
  var sql = `select Team_Waiter.TB_code,waiter_content, TB_title,TB_contestOrProject,waiter_code,waiter_time,TeamBoard.CT_code,waiter_enter,user_name,TB_recruitNumber,TB_finalNumber from Team_Waiter join User on User.user_code = Team_Waiter.waiter_code join TeamBoard on TeamBoard.TB_code = Team_Waiter.TB_code where Team_Waiter.User_code=${user_id} order by waiter_time asc;`;
  conn.query(sql, req.body.User_code, (err, rows, field) => {
    if (err) return res.status(400).json({ message: "querry error" });
    else {
      //return res.status(200).json({getMyTeamBoard : true, MyTeamBoard : rows});
      rows.map((item)=>{
        item.waiter_time = stripTime(item.waiter_time)
      })
      console.log("test", rows);
      res.status(200).json(rows);
    }
  })
})
//내 프로젝트에 신청한 사람 변경
router.post('/ApplicantsCheck/', (req, res, next) => {
  console.log("check body:", req.body)
  data = req.body.data
  check = 0
  // 신청자의 상태 변경
  var sql = `update Team_Waiter set waiter_enter=${data.state},waiter_time=now() where TB_code=${data.TB_code} and waiter_code=${data.waiter_code};`;
  conn.query(sql, req.body.User_code, (err, rows, field) => {
    if (err) return res.status(400).json({ message: "querry error" });
    else {
      console.log("신청자 업데이트 완료")
      check = 1
      //승인허가인 경우 TB_숫자 증가시키기
      if (data.state == 1) {
        var sql = `update TeamBoard set TB_recruitNumber=TB_recruitNumber+1 where TB_code=${data.TB_code};`;
        conn.query(sql, req.body.User_code, (err, rows, field) => {
          if (err) return res.status(400).json({ message: "querry error" });
          else {
            if (check == 1){
              return res.status(200).json({ status: 'success' });
            }
            else{
              return res.status(400)
            }
          }
        })
      }
    }
  })
})

//BookMark 추가
//중복방지
router.post('/addBookMark', (req, res, next) => {
  
  var sql = "insert into BookMark values (?,?)";
  params = [req.body.User_code, req.body.CB_code];
  conn.query(sql, params, (err, rows, field) => {
    if(err) return res.status(200).json({message : "이미 추가되어있습니다."});
    else {
      return res.status(200).json({addBookMark : true, message : "북마크에 추가되었습니다."});
    }
  })
})

//공모전 BookMark 가져오기
router.post('/getBookMark', (req, res, next) => {
  
  var sql = "select c.CB_code, c.CB_title, c.CB_startDate, c.CB_finalDate, c.CB_organization, c.CB_field, c.CB_target, c.CB_link from BookMark as b join CompeteBoard as c on b.CB_code = c.CB_code where b.User_code = ?";
  params = [req.body.User_code];
  conn.query(sql, params, (err, rows, field) => {
    if(err) return res.status(400).json({message : err});
    else {
      return res.status(200).json({getBookMark : true, BookMarkList : rows});
    }
  })
})

//공모전 BookMark 삭제하기
router.post('/DeleteBookMark', (req, res, next) => {

  var sql = "delete from BookMark where User_code = ? and CB_code = ?";
  params = [req.body.User_code, req.body.CB_code];
  conn.query(sql, params, (err, rows, field) => {
    if(err) return res.status(400).json({DeleteBookMark : false, message : err});
    else {
      return res.status(200).json({DeleteBookMark : true, message : "북마크가 해제되었습니다."});
    }
  })
})

//팀원모집 게시판 공모전 가져오기
router.post('/getTeamBookMark', (req, res, next) => {
  
  var sql = "select b.BTB_code, b.TB_code, t.TB_title, t.TB_recruitNumber, t.TB_finalNumber, t.TB_createDate, t.TB_finalDate, t.TB_contestOrProject from BookMarkTB as b join TeamBoard as t on b.TB_code = t.TB_code where b.User_code = ?"
  params = [req.body.User_code];
  conn.query(sql, params, (err, rows, field) => {
    if(err) return res.status(400).json({message : err});
    else {
      return res.status(200).json({getTeamBookMark : true, BookMarkList : rows});
    }
  })
})

//팀원모집 게시판 공모전 삭제하기
router.post('/DeleteTeamBookMark', (req, res, next) => {

  var sql = "delete from BookMarkTB where BTB_code = ?";
  params = [req.body.BTB_code];
  conn.query(sql, params, (err, rows, field) => {
    if(err) return res.status(400).json({DeleteTeamBookMark : false, message : err});
    else {
      return res.status(200).json({DeleteTeamBookMark : true, message : "북마크가 해제되었습니다."});
    }
  })
})

//유저의 상세데이터 확인하기
router.post('/userDetail', (req, res, next) => {
  var data = req.body.data
  console.log("tet , user_name:",data)

  var sql = "select * from User where User_name='"+data.user_name+"';";
  console.log(sql)
  conn.query(sql, (err, rows, field) => {
    if(err) return res.status(400).json({status:"success"});
    else {
      console.log(rows)
      return res.send(rows)
    }
  })
})
module.exports = router;