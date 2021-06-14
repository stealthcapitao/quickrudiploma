var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var order = require("../models/order");

//root route
router.get("/", function(req, res){
    res.render("landing");
});


// show register form
router.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});

//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar,
        phone: req.body.phone,
        info: req.body.info
      });

    if(req.body.adminCode === 'secretcode123') {
      newUser.isAdmin = true;
    }

    User.register(newUser, req.body.password, function(err, user){
      if(err){
             console.log(err);
             return res.render("register", {error: err.message});
         } else if (req.body.email == "" || req.body.firstname == "" || req.body.lastname == "" || req.body.username == "" || req.body.phone == "" || req.body.info == "" ){
           console.log(err);
             return res.render("register", {error: "Please fill all the fields"});
         }else{
           passport.authenticate("local")(req, res, function(){
            req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
            res.redirect("/orders"); 
         });
       }
     });
 });

//show login form
router.get("/login", function(req, res){
   res.render("login", {page: 'login'}); 
});

//handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/orders",
        failureRedirect: "/login",
        failureFlash: true,
        successFlash: 'Welcome to Quickru!'
    }), function(req, res){
});

// logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "See you later!");
   res.redirect("/orders");
});

// USER PROFILE
router.get("/users/:id", function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if(err) {
      req.flash("error", "Something went wrong.");
      return res.redirect("/");
    }
    order.find().where('author.id').equals(foundUser._id).exec(function(err, orders) {
      if(err) {
        req.flash("error", "Something went wrong.");
        return res.redirect("/");
      }
      res.render("users/show", {user: foundUser, orders: orders});
    })
  });
});

router.get("/Aboutus", function(req, res){
  res.render("Aboutus");
});

router.get("/Customer", function(req, res){
  res.render("Customer");
});

module.exports = router;
