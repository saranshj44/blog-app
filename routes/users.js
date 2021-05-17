var mongoose=require('mongoose');
var plm=require('passport-local-mongoose');
mongoose.connect('mongodb+srv://saransh:saransh@blogapp.zlavi.mongodb.net/blogapp?retryWrites=true&w=majority',{
  useNewUrlParser:true,
  useCreateIndex:true,
  useUnifiedTopology:true,
  useFindAndModify:false
})
.then(()=>{
  console.log("connection sucessful");
})
var UserSchema=mongoose.Schema({
  name:String,
  username:String,
  email:String,
  proimage:{
    type:String,
    default:'./images/uploads/default.png'
  },
  password:String,
  posts:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'post'
  }],
  request:[{
    type:mongoose.Schema.Types.ObjectId,
  }],
  friends:[{
    type:mongoose.Schema.Types.ObjectId,
  }]
});
UserSchema.plugin(plm);
module.exports=mongoose.model('user',UserSchema);
