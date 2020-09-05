const jwt = require('jsonwebtoken'); //auth.js is a custom authentication middleware
const config = require('config');

module.exports = function (req, res, next) {
  //since it's a middleware it has got req,res,next
  //getting token from the header
  const token = req.header('x-auth-token'); //access token is present in x auth token field
  //of the header

  //checking if no token
  if (!token) {
    console.log('no token!');
    return res.status(401).json({ msg: 'no token, authorization denied ' });
  }
  //verifying token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    req.user = decoded.user; //decoded.user indicates the user in the payload object
    next();
  } catch (err) {
    res.status(401).json({ msg: 'token not valid!' });
    console.log('token is invalid!');
  }
};
