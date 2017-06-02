var middlewareObj={};
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var Rating = require("../models/rating");
middlewareObj.checkCampgroundOwnership=function(req,res,next){
    if(req.isAuthenticated()){
        
         Campground.findById(req.params.id,function(err,foundCampground)
        {
       if(err){
            req.flash("error","campground is not found");
           res.redirect("back");
       } 
       else
       {
           if(foundCampground.author.id.equals(req.user._id)){
               next();
           }
           else
           {
               req.flash("error","You don't have permission to do that");
               res.redirect("back")
           }
       
       
       } 
    });
    }
    else{
     req.flash("error","You need to be logged in to proceed next");
     res.redirect("back");}
}
middlewareObj.checkCommentOwnership=function(req,res,next){
    
    if(req.isAuthenticated()){
         Comment.findById(req.params.comment_id,function(err,foundComment)
         {
            if(err){
                      res.redirect("back");
                  } else{
                if(foundComment.author.id.equals(req.user._id)){
                        next();
                  }
                else
                {
               res.redirect("back")
                }
            }
         });
    }
     else{
     req.flash("error","You need to be logged in to proceed next");
     res.redirect("back");}
}


middlewareObj.checkRatingExists = function(req, res, next){
  Campground.findById(req.params.id).populate("ratings").exec(function(err, campground){
    if(err){
      console.log(err);
    }
    for(var i = 0; i < campground.ratings.length; i++ ) {
      if(campground.ratings[i].author.id.equals(req.user._id)) {
        req.flash("success", "You already rated this!");
        return res.redirect('/campgrounds/' + campground._id);
      }
    }
    next();
  })
}



middlewareObj.isLoggedIn=function(req, res, next){
    if(req.isAuthenticated()){
        req.flash("success","Successfully logged in");
        
        return next();
    }
   
    req.session.redirectTo = req.originalUrl;
    req.flash("error","You need to be logged in to proceed next");
    res.redirect("/login");
}
module.exports=middlewareObj;