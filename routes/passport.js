const express = require('express');
const router = express.Router();
const passport = require('passport');
const auth = require('./Authentication');

router.post('/', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) {
          return res.status(400).json({loginSuccess : false, message : info});
        }
      if (!user) {
        console.log("아이디가 없거나 틀림");
        return res.status(200).json({loginSuccess : false, message : info});
      }
      req.logIn(user, function(err) {
        if (err) {return res.status(400).json({loginSuccess : false, message : "query error"});}
        else {
            return res.status(200).json({loginSuccess : true, user : user});
        }
      });
    })(req, res, next);
  });

//http://localhost:3001/passport 
router.get('/', function(req, res, next) {//로그인상태를 검증한다.
  if(req.isAuthenticated()) {
    return res.json({LoginState : true});}
  else {
    res.json({LoginState : false});
  }
})

//http://localhost:3001/passport/logout
router.get('/logout', (req, res, next) => { // 로그아웃해서 세션제거함
    req.logout();
    console.log("logotu start")
    console.log("logout", req.session);
    req.session.destroy();
    res.json({LoginState : false});
})

module.exports = router;