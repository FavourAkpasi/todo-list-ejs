require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const { urlencoded } = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const { stringify } = require("nodemon/lib/utils");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("Public"));
mongoose.connect("mongodb+srv://admin-akpasi:1122334455Aa.@cluster0.qmsvo.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("item", itemsSchema);

const listsSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const List = mongoose.model("list", listsSchema);

var options = {
  year: "numeric",
  month: "long",
  weekday: "long",
  day: "numeric",
};
var today = new Date();
let day = today.toLocaleDateString("en-NG", options);



app.get("/", (req, res) => {
 res.render("index")
});


app.get("/:listName", (req, res) => {
  let listName = _.capitalize(req.params.listName)
  List.findOne({ name: listName }, (err, lists) => {
    if (!lists) {
      const list = new List({
        name: listName,
        items: [],
      });
      list.save();
      res.redirect("/" + listName);
    } else {
      res.render("list", {
        thisDay: day,
        listTitle: listName,
        items: lists.items,
      });
    }
  });
});

app.post("/", (req, res) => {
  const item = new Item({ name: req.body.newItem });
  if (req.body.newItem !== "") {
    List.findOne({ name: req.body.currentList }, (err, list) => {
      list.items.push(item);
      list.save(()=>{res.redirect("/" + req.body.currentList);});
    });
  };
});

app.post("/deleteItem", (req, res) => {
  List.findOneAndUpdate(
    { name: req.body.listName },
    { $pull: { items: { _id: req.body.checked } } },
    (err, list) => {
      res.redirect("/" + req.body.listName);
    }
  );
});

app.get("/addList/new", (req, res) => {
  List.find({}, (err, lists) => {
    res.render("index", { thisDay: day, lists: lists });
  });
});

app.post("/addList/new", (req, res) => {
  let newListName = _.capitalize(req.body.newListName)
  List.findOne({ name: newListName }, (err, lists) => {
    if (newListName !== ""){
      if (!lists) {
        const list = new List({
          name: newListName,
          items: [],
        });
        list.save(()=>{ res.redirect("/addList/new");});
      } else {res.redirect("/addList/new")}
    }else {res.redirect("/addList/new")}
  });
})

app.post("/deleteList", (req, res) => {
  List.findByIdAndRemove(req.body.checked, (err) => {
    res.redirect("/addList/new");
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, function () {
  console.log("Server started.");
});
