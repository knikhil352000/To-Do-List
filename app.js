const express = require('express');
const bodyParser = require('body-parser');
const { urlencoded } = require('body-parser');
const mongoose = require('mongoose');
const app = express();
//var items = ['Buy Food', 'Cook Food','Eat Food'];
var workItems = [];
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true })); app.use(bodyParser.json({limit: '5mb'})); app.use(bodyParser.raw({limit: '5mb'}) );
app.use(express.static("public"));
mongoose.connect('mongodb://localhost:27017/todolistDB',{ useNewUrlParser: true , useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
const itemsSchema = ({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name:'Bring Food'
});
const item2 = new Item({
    name:'Cook Food'
});
const item3 = new Item({
    name:'Eat Food'
});
const defaultItems = [item1,item2,item3]; 

const listSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);
app.get('/', function(req, res){
    Item.find({},function(err, foundItems){

        if(foundItems.length === 0){
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log('Added Succesfully');
                }
            });
            res.redirect("/");
        }else{
            res.render('list',{listTitle:'Today', newListItem : foundItems});
        }
    });
});

app.get('/:customListName', function(req, res){
    const customListName = req.params.customListName;
    List.findOne({name: customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                //create a new list
                const list = new List({
                    name:customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect('/' + customListName);
            }else{
                //show existing list
                res.render('list',{listTitle:foundList.name, newListItem : foundList.items})
            }
        }else{
            console.log(err);
        }
    });
    
});

app.post("/",function(req, res){ 
    const itemName = req.body.newItem;
    const listName = req.body.list;
    
    const item = new Item({
        name: itemName
    });
    if(listName === 'Today'){
        item.save();
        res.redirect('/');
    }else{
            List.findOne({name:listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect('/' + listName);
        });
    }
});

app.post('/delete',function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if(listName == 'Today'){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(!err){
                console.log('Successfully Deleted');
                res.redirect('/');
            }
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items : {_id: checkedItemId}}}, function(err, foundList){
            if(!err){
                res.redirect('/' + listName);
            }
        });
    }
    
});
app.listen(3000, function(){
    console.log('Server started on port 3000'); 
});