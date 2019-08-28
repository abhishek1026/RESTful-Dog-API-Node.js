var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var usersSchema = new Schema({
  username: {
    type: String, 
    required: true,
    unique: true
  }, 
  email: {
    type: String, 
    required: true, 
    unique: true
  }, 
  password: {
      type: String, 
      required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    unique: true
  },
  dogsOwned: {
      type: [String],
      default: []
  }
},
{
  usePushEach: true
}
);

usersSchema.pre('save', function(next) {
  var currentTime = new Date;
  this.updated_at = currentTime;
  if(!this.created_at)
  {
    this.created_at = currentTime;
  }
  next();
});



var User = mongoose.model('User', usersSchema, 'users');

module.exports = User;