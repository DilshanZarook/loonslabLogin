if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
  }
  
  // Importing all Libraies that we installed using npm
  const express = require("express");
  const app = express();
  const bcrypt = require("bcrypt"); // Importing bcrypt package
  const passport = require("passport");
  const initializePassport = require("./passport-config");
  const flash = require("express-flash");
  const session = require("express-session");
  const methodOverride = require("method-override");
  const port = process.env.PORT || 3001;
  
  // Set up EJS as the view engine
  app.set('view engine', 'ejs');
  
  // Initialize Passport
  initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
  );
  
  const users = [];
  
  app.use(express.urlencoded({ extended: false }));
  app.use(flash());
  app.use(session({
    secret: 'Dilshan123',
    resave: false, // We won't resave the session variable if nothing is changed
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(methodOverride("_method"));
  
  // Configuring the login post functionality
  app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
    failureFlash: true // This enables flash messages for failed logins
  }));
  
  // Configuring the register post functionality
  app.post("/register", checkNotAuthenticated, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      users.push({
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      });
      console.log(users); // Display newly registered in the console
      res.redirect("/login");
    } catch (e) {
      console.log(e);
      res.redirect("/register");
    }
  });
  
  app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login', { message: req.flash('error') }); // Assuming you're using express-flash for flash messages
  });
  
  // Define the route for index.ejs first
  app.get('/', checkNotAuthenticated, (req, res) => {
    res.render("index.ejs"); // Serve index.ejs
  });
  
  // Then define the routes for login, register, and home
  app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render("login.ejs");
  });
  
  app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render("register.ejs");
  });
  
  // Protect the /home route with authentication middleware
  app.get('/home', checkAuthenticated, (req, res) => {
    res.render("home.ejs", { name: req.user.name });
  });
  
  app.delete("/logout", (req, res) => {
    req.logout(req.user, err => {
      if (err) return next(err);
      res.redirect("/");
    });
  });
  
  // Authentication middleware
  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/");
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/");
    }
    next();
  }
  
  app.listen(port, () => {
    console.log('server started');
  });