var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var middleware=require("../middleware");
 var expressSanitizer=require("express-sanitizer");
 router.use(expressSanitizer());
//INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds:allCampgrounds});
       }
    });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn,function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var price=req.body.price;
    var desc = req.sanitize(req.body.description);
    var author={
        id:req.user._id,
        username:req.user.username
    }
    var newCampground = {name: name,price:price, image: image, description: desc,author:author}
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            req.flash("success","Campground is successfully created");
            //redirect back to campgrounds page
            res.redirect("/campgrounds/new");
        }
    });
});

//NEW - show form to create new campground
router.get("/new",middleware.isLoggedIn, function(req, res){
    req.flash("error","You need to be logged in to proceed next");
   res.render("campgrounds/new"); 
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").populate("ratings").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            var rating = foundCampground.ratings.reduce(function(prev, curr) {
                return Number(prev.rating) + Number(curr.rating);
            });
            rating = rating / foundCampground.ratings.length;
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground, rating: rating});
        }
    });
});
//Edit Campground Route
router.get("/:id/edit",middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id,function(err,foundCampground)
        {
             req.flash("error","campground not found");
            res.render("campgrounds/edit",{campground:foundCampground});
        });
    }); 
        


   

//Update Campground Route

router.put("/:id",middleware.checkCampgroundOwnership ,function(req,res)
{
    var details={
        name:req.body.name,
        image:req.body.image,
        price:req.body.price,
        description:req.sanitize(req.body.description)
    }
   
   Campground.findByIdAndUpdate(req.params.id,details,function(err ,updateCampground)
   {
       if(err){
        req.flash("error","campground not found");
       res.redirect("/campgrounds");}
       else
       {
           req.flash("success","Campground is updated");
       res.redirect("/campgrounds/"+req.params.id);
       }
   });
});

//DELETE

router.delete("/:id",middleware.checkCampgroundOwnership,function(req,res)
{
   //destroy blog
   Campground.findByIdAndRemove(req.params.id,function(err)
   {
       if(err)
       res.redirect("/campgrounds");
       else
       {
       req.flash("success","campground successfully removed");
       res.redirect("/campgrounds");
       }
   });
  
  
});



module.exports = router;

