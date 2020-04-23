//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-prajwal:abcd.123@cluster0-odcdr.mongodb.net/todolistDB",{useNewUrlParser:true,useUnifiedTopology:true});

//Schema for todolist tasks.
const itemsSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  }
});

const Item = mongoose.model("Item",itemsSchema);

//Schema to store list name(title) and tasks.
const listSchema = new mongoose.Schema({
  name:String,
  items:[itemsSchema]
})

const List = mongoose.model("List",listSchema);


app.get("/", function(req, res) {

  Item.find(function(err,items){
    if(err){
      console.log(err);
    }else{
    res.render("list", {listTitle: "Today", newListItems: items});
      }

    })

  });

 //To handle dynamic(custom) lists.
  app.get("/:newListName",function(req,res){

    List.findOne({name:req.params.newListName},function(err,foundList){
      if(!err){
        //If the requested list doesnt exist creates new List.
        if(!foundList){
          const listName = new List({
            name:req.params.newListName,
            items:[]
          })
          listName.save();
          res.redirect("/"+req.params.newListName);
        }
        else{
          //Shows existing list.
          res.render("list",{listTitle: _.capitalize(foundList.name), newListItems: foundList.items});
        }
      }
    })

  });


app.post("/", function(req, res){

  const itemName =new Item({name: req.body.newItem});
  //req.body.list constains the name of the list
  if(req.body.list==="Today"){
    itemName.save();
    res.redirect("/");
  }

  //Adding tasks to custom list.
else{
  List.findOne({name:_.lowerCase(req.body.list)},function(err,foundList){
    if(!err){
      console.log(req.body.list);
      foundList.items.push(itemName);
      foundList.save();
      res.redirect("/"+_.lowerCase(req.body.list));
    }
  })
}


});

app.post("/delete",function(req,res){
 if(req.body.listName==="Today"){
   Item.findByIdAndRemove(req.body.checkedItem,function(err){
     if(err){
       console.log(err);
     }else{
       res.redirect("/");
     }
   });
 }else{
   List.findOneAndUpdate({name:_.lowerCase(req.body.listName)},{$pull:{items:{_id:req.body.checkedItem}}},function(err,results){
     if(!err){
       res.redirect("/" + _.lowerCase(req.body.listName));
     }
   })
 }
});



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started on port 3000");
});
