var mongoose=require('mongoose');
var random = require('mongoose-simple-random');

var PostSchema=mongoose.Schema({
  author:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'user'
  },
  post:String,
  like:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:'user'
  }],
  time:{
      type:Date,
      default:Date.now
  }
});

PostSchema.plugin(random);

module.exports=mongoose.model('post',PostSchema);
