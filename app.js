const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
// const bcrypt = require('bcrypt');
const logger = require('morgan');
const passport = require('passport');
const session = require('express-session');
const passportConfig = require('./passport');
// const FileStore = require('session-file-store')(session);

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const contestRouter = require('./routes/contest');
const LoginRouter = require('./routes/passport');
const adminRouter = require('./routes/admin');
const teamRouter = require('./routes/team');

const teamBoardRouter = require('./routes/teamBoard');
const bookmarkTBRouter = require('./routes/bookmarkTB');

const cron = require('./utils/autoCrawling')

const app = express();
passportConfig();
const cors = require('cors');
let corsOptions = {
  origin: 'http://34.71.226.15:8080', // 허락하고자 하는 요청 주소
  //origin: 'http://localhost:3000', // 허락하고자 하는 요청 주소
  credentials: true // true로 하면 설정한 내용을 response 헤더에 추가 해줍니다.
} 
app.use(cors(corsOptions)); // config 추가
// app.use(cors()); // CORS 미들웨어 추가 그러나 보안상 취약해질 수 있다.

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  //resave : false, // 이거하면 쿠키 인증이 안됨.
  resave : true,
  saveUninitialized : false,
  secret : process.env.COOKIE_SECRET,
  // store : new FileStore(),
  cookie : {
    httpOnly : true,
    secure : false,
  },
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/contest', contestRouter);
app.use('/passport', LoginRouter);
app.use('/admin', adminRouter);
app.use('/teamboard', teamBoardRouter);
app.use('/bookmarkTB', bookmarkTBRouter);
app.use('/team', teamRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
