const mongoose = require('mongoose');

module.exports = function(uri, options){
  return mongoose.connect(uri, options);
};
