//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
// database : to coonect to the localhost
//mongoose.connect('mongodb://localhost:27017/todolistDB',{useNewUrlParser:true,useUnifiedTopology:true, useFindAndModify: false })
// to conect to mongodb atlas
mongoose.connect(
  "mongodb+srv://admin-wajdi:123tEST@cluster0.941cx.mongodb.net/todolistDB",
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
);
const itemSchema = {
  name: String,
};
const listSchema = {
  name: String,
  items: [itemSchema], // array of itemSchema
};
const Item = mongoose.model("item", itemSchema);
// collection for the custome list
const List = mongoose.model("list", listSchema);

const item1 = new Item({
  name: "Welcome to your todolist!",
});
const item2 = new Item({
  name: "hit the + button to add a new item",
});
const item3 = new Item({
  name: "<-- Hit this to delete an item",
});
const defaultItems = [item1, item2, item3];

//database end
app.get("/", function (req, res) {
  Item.find({}, (err, items) => {
    if (err) {
      console.log(err);
    } else if (items.length === 0) {
      // for insert it one time
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/");
        }
      });
    } else {
      res.render("list", { listTitle: "Today", newListItems: items });
    }
  });
});
app.post("/delete", (req, res) => {
  const deletedItem = req.body.checkbox;
  const list = req.body.listTitle;
  // this function for delete doc by using only id
  if (list === "Today") {
    Item.findByIdAndRemove(deletedItem, (err) => {
      res.redirect("/");
    });
  } else {
    //The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    List.findOneAndUpdate(
      { name: list },
      { $pull: { items: { _id: deletedItem } } },
      (err, result) => {
        res.redirect("/" + list);
      }
    );
  }
});

// GET customLIstName
app.get("/:customListName", (req, res) => {
  //Converts the first character of string to upper case and the remaining to lower case.
  const customListName = _.capitalize(req.params.customListName); //_.capitalize('FRED'); output : Fred

  List.findOne({ name: customListName }, (err, result) => {
    if (result === null) {
      //create a new list
      const list = new List({
        name: customListName,
        items: defaultItems,
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      //show an existiong list
      res.render("list", {
        listTitle: result.name,
        newListItems: result.items,
      });
    }
  });
});

app.post("/", function (req, res) {
  //add new item
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName,
  });
  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, list) => {
      // find the list name and add item to the items table
      list.items.push(newItem);
      list.save();
      res.redirect("/" + listName);
    });
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

//listen to thr correct port
let port = process.env.PORT;
if (port === null || port === "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server started succesfully");
});

//https://agile-temple-78179.herokuapp.com/Work
