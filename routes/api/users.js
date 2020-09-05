const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

//desc : register user
//route: POST api/users
router.post(
  '/',
  [
    check('name', 'name is required').not().isEmpty(), //checks if the name field is !empty,if it is then show name is required
    check('email', 'email is required').isEmail(),
    check(
      'password',
      'password should contain at least 6 characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ received_errors: errors });
    }

    const { email, password, name } = req.body; //it simply took the name,email,password items from the req.json file and saved it here by the same name with const type
    try {
      //seeing if user exists
      let user = await User.findOne({ email: email });

      if (user) {
        console.log('this email is already registered!');
        return res.status(400).json({
          received_errors: { msg: 'this email is already registered' },
        });
      }
      //getting the user's gravatar
      const avatarImage = gravatar.url(email, {
        s: 200,
        r: 'pg', //rating PG
        default: 'mm', //shows user icon image if user doesnt have any image
      });
      user = new User({
        name,
        password,
        email,
        //avatar,
      });

      //encrypting password using bcrypt
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

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
            console.log(token);
          }
        }
      );
      //res.send('user has been registered!');
      console.log(
        'registered! name is: ' + name + ' and email is: ' + email + '\n'
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send('server error');
    }
  }
);

module.exports = router;
