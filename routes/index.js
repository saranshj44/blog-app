var express = require('express');
const passport = require('passport');
var router = express.Router();
var UserModel=require('./users');
var PostModel=require('./post');
var localstrategy=require('passport-local');
var multer=require('multer');
passport.use(new localstrategy(UserModel.authenticate()));



///////////////////////multer//////////////////
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    var date=new Date();
    var filename=date.getMilliseconds()+file.originalname;
    cb(null, filename)
  }
})
 
var upload = multer({ storage: storage })

// ////////middile ware
const isloggedin=(req,res,next)=>{
  if(req.isAuthenticated()){
    return next()
  }
  else{
    req.flash('Error', 'You Need To Login First');
    res.redirect('/login');
  }
}



/* GET home page. */
router.get('/', function(req, res) {
  if(req.isAuthenticated()){
    PostModel.findRandom({}, {}, {limit:3,populate:'author'}, (err, results)=> {
      if (!err) {
        res.render('index',{loggedin:true,details:results});  
      }
    }) 
  }
  PostModel.findRandom({}, {}, {limit:3,populate:'author'}, (err, results)=> {
    if (!err) {
      res.render('index',{loggedin:false,details:results});  
    }
  })
});

router.get('/writepost',(req,res)=>{
  UserModel.findOne({username:req.session.passport.user})
  .then((details)=>{
    res.render('writepost',{details});
  })
})

router.get('/getrandampost',function(req,res){
 PostModel.findRandom({}, {}, {limit:2,populate:'author'}, function(err, results) {
    if (!err) {
      res.send(results); 
    }
  })
})



router.get('/like/:id',isloggedin,(req,res)=>{
  UserModel.findOne({username:req.session.passport.user})
  .then(function(loggedInUser){
    PostModel.findOne({_id:req.params.id})
    .then(function(postFound){
      if(postFound.like.indexOf(loggedInUser._id) === -1){
        postFound.like.push(loggedInUser);
        postFound.save()
        .then(function(){
          req.flash('info', 'Like Added !')
          res.redirect('/');
      })
      }else{
        postFound.like.pop(loggedInUser);
        postFound.save()
        .then(function(){
          req.flash('info', 'Like Removed !')
          res.redirect('/');
      })
      }
    });
  })
})

router.get('/notification',function(req,res){
  UserModel.findOne({username:req.session.passport.user})
  .then()
  res.render('notifcations');

  // // res.send('hello');
})

router.get('/login',(req,res)=>{
  res.render('login');
})

router.get('/register',(req,res)=>{
  res.render('register');
})

router.get('/blog',isloggedin,(req,res)=>{
  PostModel.find()
  .then(allpost=> res.send(allpost.reverse()));
});


router.get('/update/:id',isloggedin,(req,res)=>{
  UserModel.findOne({_id:req.params.id})
  .then((loggedinuser)=>{
    res.render('update',{loggedinuser})
  })
})

router.post('/update',(req,res)=>{
  UserModel.findOneAndUpdate({username:req.session.passport.user},{
    name:req.body.name,
    username:req.body.username,
    email:req.body.email
  })
  .then(updateduser=>{
    res.redirect('/profile');
  })
})

router.post('/register',(req,res)=>{
  var NewUser=new UserModel({
    name:req.body.name,
    username:req.body.username,
    email:req.body.email
  })
  UserModel.register(NewUser,req.body.password)
  .then((data)=>{
    passport.authenticate('local')(req,res,()=>{
      res.redirect('/profile');
    })
  })
})

router.post('/upload',upload.single('image'),(req,res)=>{
  console.log(req.file)
  var path=`./images/uploads/${req.file.filename}`;
  UserModel.findOneAndUpdate({username:req.session.passport.user},{proimage:path})
  .then((loggedinuser)=>{
      console.log(path)
      req.flash('success','Image Uploaded Sucessfully');
      res.redirect('profile');
  })
})

router.post('/uploadpost',(req,res)=>{
  UserModel.findOne({username:req.session.passport.user})
  .then((loggedinuser)=>{
    PostModel.create({
      post:req.body.post,
      author:loggedinuser
    })
    .then(postcreated=>{
      loggedinuser.posts.push(postcreated)
      loggedinuser.save()
      .then(()=>{
        res.redirect('/profile');
      })
    })
  })
})




router.get('/profile',isloggedin,(req,res)=>{
  UserModel.findOne({username:req.session.passport.user})
  .populate('posts')
  .then((data)=>{
    res.render('profile',{details: data});
  })
})

router.post('/login',passport.authenticate('local',{
  successRedirect:'/profile',
  failureRedirect:'/login'
}),(req,res)=>{});

router.get('/logout',(req,res)=>{
  req.logOut();
  res.redirect('/');
})

module.exports = router ;