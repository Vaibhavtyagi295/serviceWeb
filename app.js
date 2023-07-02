var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var expressSession =require('express-session');
var passport = require('passport');


var app = express();

// view engine setup
app.use(express.static(path.join(__dirname, '../public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressSession({
  resave:false,
  saveUninitialized:false,
  secret:"something"
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(usersRouter.serializeUser());
passport.deserializeUser(usersRouter.deserializeUser());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/register', indexRouter);
app.use('/login', indexRouter);
app.use('/logout', indexRouter);
app.use('/api/check-login', indexRouter);
app.use('/categories', indexRouter);
app.use('/categories/:categoryId/subcategories', indexRouter);
app.use('/category/:categoryId/subcategories', indexRouter);
app.use('/category', indexRouter);
app.use('/workerregister', indexRouter);
app.use('/workerregister', indexRouter);
app.use('/workerlogin', indexRouter);
app.use('/getUserRole', indexRouter);
app.use('/workerregister/requests', indexRouter);
app.use('/api/worker/:id', indexRouter);
app.use('/api/worker/:workerId/reviews', indexRouter);
app.use('/api/worker/:workerId/rating', indexRouter);
app.use('/api/saveNameAndNumber', indexRouter);
app.use('/workerregister/requests/:id/approve', indexRouter);
app.use('/workerregister/requests/:id/sendmessage', indexRouter);
app.use('/subcategory/:subcategoryId/workers', indexRouter);
app.use('/api/posts', indexRouter);
app.use('/api/posts/:postId/like', indexRouter);
app.use('/api/posts/:postId/comment', indexRouter);
app.use('/api/posts/:postId/share', indexRouter);
app.use('/api/checkSelection', indexRouter);
app.use('/api/checkSelection/:categoryId', indexRouter);


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
