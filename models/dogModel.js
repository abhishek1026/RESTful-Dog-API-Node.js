var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var dogSchema = new Schema({
  name: {
    type: String, 
    default: "Max"
  }, 
  color: {
    type: String, 
    default: "Yellow"
  },
  breed: {
    type: String,
    default: "Golden Retriever"
  },
  address: {
      type: String,
      required: true,
      unique: true
  },
  weight: {
      type: Number,
      default: 15
  }, 
  created_at: Date,
  updated_at: Date
});

/* create a 'pre' function that adds the updated_at (and created_at if not already there) property */
dogSchema.pre('save', function(next) {
  var currentTime = new Date;
  this.updated_at = currentTime;
  if(!this.created_at)
  {
    this.created_at = currentTime;
  }
  next();
});


var Dog = mongoose.model('Dog', dogSchema, 'Dogs');

/* Export the model to make it avaiable to other parts of your Node application */
module.exports = Dog;