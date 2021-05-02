const dotenv = require('dotenv');
var mysql = require('mysql');

dotenv.config();
var db_info = {
    host: process.env.DB_HOST,
    port: process.env.SERVER_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset : process.env.DB_ENCODING
}

module.exports = {
    init: function () {
        return mysql.createConnection(db_info);
    },
    connect: function(conn) {
        conn.connect(function(err) {
            if(err) console.error('mysql connection error : ' + err);
            else console.log('mysql is connected successfully!');
        });
    }
}