const express = require('express');
const router = express.Router();
const db = require('../config/database.js');
const conn = db.init();

// module.exports = {
//     isOwner:function(req, res) {
//         console.log(req.user);
//         if(req.user) {
//             return true;
//         } else {
//             return false;
//         }
//     }
// }

//아이디 중복 검사
exports.idOVerlap = (req, res, next) => {
    
    var sql = "select EXISTS (select * from User where User_id = ?) as success";
    conn.query(sql, req.body.User_id, function(err, rows, field) {
        if(err) return res.status(400).json({SignUp : false, message : "아이디 중복 쿼리 오류."});
        else {
            // console.log(rows[0]);
            if(rows[0] == 1) { // 존재하면
                return res.status(200).json({SignUp : false, message : "이미 존재하는 아이디입니다."});
            } else if(rows[0] == 0) { // 없으면
                next();
            } else {
                return res.status(200).json({SignUp : false, message : "이미 존재하는 아이디입니다."});
            }
        }
    })
}
