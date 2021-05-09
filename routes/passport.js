const express = require('express');
const router = express.Router();
const passport = require('passport');
const auth = require('./Authentication');

router.post('/', function(req, res, next) {

    passport.authenticate('local', function(err, user, info) {
      if (err) {
          res.status(400).json({loginSuccess : false});
        }
      if (!user) {res.status(400).json({loginSuccess : false});}
      req.logIn(user, function(err) {
        if (err) {res.status(400).json({loginSuccess : false});}
        else {
            return res.status(200).json({loginSuccess : true, user : user});
        }
      });
    })(req, res, next);
  });

router.get('/', function(req, res, next) {
    if(req.isAuthenticated()) {console.log(req.isAuthenticated()); return res.json({LoginState : true});}
    else {console.log(req.isAuthenticated()); res.json({LoginState : false});}
})

router.get('/logout', (req, res, next) => {
    req.logout();
    req.session.destroy();
    res.json({logout : true});
})

module.exports = router;