const express = require('express');
const bodyParser = require('body-parser');
const { urlencoded } = require('body-parser');

const app = express();
var items = [];
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true })); app.use(bodyParser.json({limit: '5mb'})); app.use(bodyParser.raw({limit: '5mb'}) );
app.use(express.static("public"));

app.get('/', function(req, res){
    var today = new Date();
    var options = {
        weekday : "long",
        day : "numeric",
        month : "long"

    };
    var day = today.toLocaleDateString("en-US", options);
    res.render('list', {kindOfDay : day, newListItem: items});
    
    
});
app.post("/",function(req, res){ 
    var item = req.body.newItem;
    items.push(item);
    res.redirect('/');
});
app.listen(3000, function(){
    console.log('Server started on port 3000'); 
});