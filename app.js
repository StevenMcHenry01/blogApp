var express    = require("express"),
    app        = express(),
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    override   = require("method-override"),
    sanitizer  = require("express-sanitizer");

// app config
mongoose.connect("mongodb://localhost/blog_app");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(override("_method"));
app.use(sanitizer());
app.set("view engine", "ejs");

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

// mongoose/model config
var blogSchema = new mongoose.Schema({
    title: String,
    image: {type: String, default: "https://i.pinimg.com/originals/1a/51/1d/1a511daa34664a7f1da9eacb43fbcced.png"},
    body: String,
    created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);

////////////////////
// RESTFUL ROUTES //
////////////////////

app.get("/", function(req, res){
    res.redirect("/blogs");
});

// index route
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err);
        } else {
            res.render("index", {blogs: blogs});
        }
    });
});

// new route
app.get("/blogs/new", function(req, res){
    res.render("new");
});

// create route
app.post("/blogs", function(req, res){
    //sanitize blog input
    req.body.blog.body = req.sanitize(req.body.blog.body);

    // create blog
    Blog.create(req.body.blog, function(err, newBlog){
        if(err) {
            res.render("new");
        } else {
            // redirect to index
            res.redirect("/blogs")
        }
    });
});

// show route
app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           res.redirect("/blogs");
       } else {
           res.render("show", {blog: foundBlog});
       }
    });
});

// edit route
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
           res.redirect("/blogs");
       } else {
           res.render("edit", {blog: foundBlog});
       }
    });
});

// update route
app.put("/blogs/:id", function(req, res){
    //sanitize blog update
    req.body.blog.body = req.sanitize(req.body.blog.body);

    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// destroy route
app.delete("/blogs/:id", function(req, res){
    //destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err){
        if (err) {
            res.redirect("/blogs");
        } else {
            //redirect
            res.redirect("/blogs");
        }
    });
});

// listen for server
app.listen(3000, function(){
    console.log("Blog-App Server is on!");
});