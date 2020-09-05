const mongoose = require('mongoose');
const config = require('config'); //getting config package
const db = config.get('mongoURI'); //this way we can get any of the values from the json file in config folder

const connectDB = async () => {
  //function is actually called connectDB and definition of it is a promise
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log('mongo db connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
module.exports = connectDB;
