require("./database");
const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');

const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const User = require("./models/user");

const bankHolidaysRouter = require('./routes/bank-holidays');

const app = express();

app.use(cors({
  origin: '*'
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(require("express-session")({
  secret: "Login is dummy",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({ usernameField: 'username' }, User.authenticate()));
// passport.use(new LocalStrategy(User.authenticate()));
// passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//=====================
// ROUTES
//=====================

// Showing register page
app.get("/", function (req, res) {
  res.render('register', {
    title: 'Registration Page',
    name: '',
    username: '',
    password: ''
  })
});

// Showing home page
app.get("/home", isLoggedIn, function (req, res) {
  res.render("home");
});

// Handling user signup
app.post("/register", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const name = req.body.name;
  User.register(new User({ username: username, password: password, name: name }), password, function (err, user) {
    if (err) {
      console.log(err);
      return res.render("register");
    }
    passport.authenticate("local")(req, res, function () {
      res.render("home");
    });
  });
});

//Showing login form
app.get("/login", function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect("home");
  } else {
    res.render('login', {
      title: 'Login',
      username: '',
      password: ''
    })
  }
});

//Handling user login
app.post('/login', (req, res, next) => {
  passport.authenticate('local',
    (err, user, info) => {
      console.log(err);
      console.log(user);
      console.log(info);
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.redirect('/login');
      }

      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        return res.redirect('/home');
      });

    })(req, res, next);
});

// //Handling user login
// app.post("/login", passport.authenticate("local", {
//   successRedirect: "/home",
//   failureRedirect: "/login"
// }), function (req, res) {
// });

//Handling user logout
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.use('/bank-holidays', bankHolidaysRouter);

function isLoggedIn(req, res, next) {
  console.log(req);
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect("/login");
}

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;