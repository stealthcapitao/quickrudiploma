var express = require("express");
var router  = express.Router();
var order = require("../models/order");
var middleware = require("../middleware");


// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//INDEX - show all orders
router.get("/", function(req, res){
  if(req.query.search && req.xhr) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      // Get all orders from DB
      order.find({name: regex}, function(err, allorders){
         if(err){
            console.log(err);
         } else {
            res.status(200).json(allorders);
         }
      });
  } else {
      // Get all orders from DB
      order.find({}, function(err, allorders){
         if(err){
             console.log(err);
         } else {
            if(req.xhr) {
              res.json(allorders);
            } else {
              res.render("orders/index",{orders: allorders, page: 'orders'});
            }
         }
      });
  }
});

//CREATE - add new order to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to orders array
  var name = req.body.name;
  var category = req.body.category;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  var cost = req.body.cost;
  

  if(req.body.image == ""){
    image = "https://static.tildacdn.com/tild3237-6466-4835-b632-663361333266/no-image-view-board.png";
  }

    var neworder = {name: name, category: category, image: image, description: desc, cost: cost, author:author};
    // Create a new order and save to DB
    order.create(neworder, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to orders page
            console.log(newlyCreated);
            res.redirect("/orders");
        }
    });
  });


//NEW - show form to create new order
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("orders/new"); 
});

// SHOW - shows more info about one order
router.get("/:id", function(req, res){
    //find the order with provided ID
    order.findById(req.params.id).populate("orders").exec(function(err, foundorder){
        if(err){
          console.log(err);
        } else {
          console.log(foundorder)
          //render show template with that order
          res.render("orders/show", {order: foundorder});
        }
    });
});

router.get("/:id/edit", middleware.checkUserorder, function(req, res){
  //find the orders with provided ID
  order.findById(req.params.id).populate("order").exec(function(err, foundorder){
      if(err){
          console.log(err);
      } else {
          //render show template with that order
          res.render("orders/edit", {order: foundorder});
      }
  });
});

router.put("/:id", function(req, res){
    var newData = {name: req.body.name, category: req.body.category, image: req.body.image, description: req.body.description, cost: req.body.cost};
    order.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, order){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/orders");
        }
    });
  });


router.delete("/:id", function(req, res) {
  order.findByIdAndRemove(req.params.id, function(err, order) {
    order.remove({
      _id: {
        $in: order.comments
      }
    }, function(err, orders) {
      req.flash('error', order.name + ' deleted!');
      res.redirect('/orders');
    })
  });
});



module.exports = router;

