var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");

//root route
router.get("/", function(req, res){
    res.render("landing");
});

// show register form
router.get("/register", function(req, res){
   res.render("register"); 
});

//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error",err.message);
            
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success","Welcome to Yelp Camp "+user.username);
           res.redirect("/campgrounds"); 
        });
    });
});

//show login form
router.get("/login", function(req, res){
   res.render("login"); 
});

//handling login logic
router.post("/login",function(req,res,next){
  passport.authenticate("local",function(err,user,info){
    if(err){
     
       req.flash("error","Invalid username or password");
    } 
    if(!user){
        console.log(err.message);
         req.flash("error","Invalid username or password");
    return res.redirect("/login");}
    req.logIn(user,function(err)
    {
        if(err){
            
            req.flash("error","Invalid username or password");}
        else{
         req.flash("success","Welcome to Yelp Camp "+user.username);
        var redirectTo=req.session.redirectTo? req.session.redirectTo:'/campgrounds';
        delete req.session.redirectTo;
        res.redirect(redirectTo);
        }
    });
    })(req,res,next);  
} );
        
   

// logout route
router.get("/logout", function(req, res){
    
     req.flash("success", "See you soon "+req.user.username);
     req.logout();
    res.redirect("/campgrounds");
});


module.exports = router;