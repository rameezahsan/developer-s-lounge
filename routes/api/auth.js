const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

router.get('/', auth, async (req, res) => {
  //notice the auth in the middle above. its a middleware made by us and it's being ported here
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('SERVER ERROR!');
  }
});

//route POST api/auth
//desc login user
//access public

router.post(
  '/',
  [
    check('email', 'email is required').isEmail(),
    check('password', 'password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ received_errors: errors });
    }

    const { email, password } = req.body; //it simply took the name,email,password items from the req.json file and saved it here by the same name with const type
    try {
      //seeing if user exists
      let user = await User.findOne({ email: email });

      if (!user) {
        console.log('invalid id or password');
        return res.status(400).json({
          received_errors: { msg: 'invalid id or password' },
        });
      }

      const doesMatch = await bcrypt.compare(password, user.password);

      if (!doesMatch) {
        console.log('invalid id or password');
        return res.status(400).json({
          received_errors: { msg: 'invalid id or password' },
        });
      }

      //returning json web token, Once the user is logged in, each subsequent request will
      // include the JWT, allowing the user to access routes, services, and resources
      // that are permitted with that token.
      const payload = {
        user: {
          id: user.id, //this id is provided by mongoDB by default. can also be written as _id
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 }, //expiration is optional
        (err, token) => {
          if (err) {
            console.log(err);
            res.json({ err });
          } else {
            res.json({ token }); //else
            console.log('token: ' + token);
          }
        }
      );
      console.log('logged in via email: ' + email + '\n');
    } catch (err) {
      console.log(err.message);
      res.status(500).send('server error');
    }
  }
);
module.exports = router;
