const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');
const { check, validationResult } = require('express-validator/check');
const request = require('request');
const config = require('config');

//route GET api/profile/me
//desc Get current user's profile
//access private cuz we're now logged in!
router.get('/me', auth, async (req, res) => {
  //IMPORTANT:whatever route we wanna protect we simply gotta take and put the middleware
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res
        .status(400)
        .json({ message: 'sorry! no profile found for this user' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('server error');
  }
});

//route POST api/profile
//desc create/update current user's profile
//access private cuz we're now logged in!

router.post(
  '/',
  [
    auth, //auth is the first middleware here
    [
      check('status', 'status is required').not().isEmpty(), //and these checks are the second middlewares
      check('skills', 'skills are required!').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    //build profile object
    const profileFields = {}; //object declaration
    profileFields.user = req.user.id; //"user" property of profilefields is being assigned
    if (company) profileFields.company = company; //if company exists,"company" property of profilefields is being assigned
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(',').map((skill) => skill.trim()); //trim removes white spaces from both sides of the string and .split replaces the parameter value with a <,>
    }
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (twitter) profileFields.social.twitter = twitter;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        console.log('existing profile...\n');
        // if profile found, then updating an existing profile

        profile = await Profile.findOneAndUpdate(
          { user: req.user.id }, //finding via the id here
          { $set: profileFields }, //$set is the update operator, it finds the specified variable/object then updates the older values with recent values, and if the specified variable isnt found, a new variable is created of the specified name.
          { new: true } //f you have a POST findOneAndUpdate(), you'll get the old document unless you specify { new: true }.
        );
        return res.json(profile);
      }
      //else creating a new profile!
      profile = new Profile(profileFields);
      console.log('new profile entry in profile db..\n');
      await profile.save();
      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('server error');
    }
  }
);

//route GET api/profile
//desc get all profiles
//access public

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']); //here populate simply adds on name and avatar to the profile data being displayed
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('server error..');
  }
});

//route GET api/profile/user/:user_id
//desc get profile by  a user's id
//access public

router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']); //here populate simply adds on name and avatar to the profile data being displayed
    if (!profile) {
      return res
        .status(400)
        .json({ message: 'no profile found for this user id' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ message: 'invalid format for a user id' });
    }
    res.status(500).send('server error..');
  }
});

//route DELETE api/profile
//desc deletes profile, user and posts
//access private

router.delete('/', auth, async (req, res) => {
  try {
    //remove user posts
    await Post.deleteMany({ user: req.user.id });

    //below removes the profile from Profile collection
    await Profile.findOneAndRemove({ user: req.user.id });

    //below removes user from User collection
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ message: 'User deleted!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('server error..');
  }
});

//route PUT api/profile/experience
//desc add profile experience
//access private

router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'title is required').not().isEmpty(),
      check('company', 'company is required').not().isEmpty(),
      check('from', 'from-date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp); //unshift is just like push , other than it pushes on the top,rather than at the end
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('server error ');
    }
  }
);

//route DELETE api/profile/experience/:exp_id
//desc delete profile experience
//access private

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    //get the remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id); //indexOf matches the item.id with the exp_id
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(400).send('server error..');
  }
});

//route PUT api/profile/education
//desc add profile education
//access private

router.put(
  '/education',
  [
    auth,
    [
      check('school', 'school is required').not().isEmpty(),
      check('degree', 'degree is required').not().isEmpty(),
      check('from', 'from-date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu); //unshift is just like push , other than it pushes on the top,rather than at the end
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('server error ');
    }
  }
);

//route DELETE api/profile/education/:edu_id
//desc delete profile education
//access private

router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    //get the remove index
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id); //indexOf matches the item.id with the edu_id
    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(400).send('server error..');
  }
});

//route GET api/profile/github/:username
//desc get user repo from github
//access public

router.get('/github/:username', (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5
      &sort=created:asc
      &client_id=${config.get('githubClientId')}
      &client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'nodejs' },
    };
    request(options, (error, response, body) => {
      if (error) {
        console.log(error.message);
      }
      if (res.statusCode != 200) {
        //if the status isnt good / profile not found
        return res
          .status(404)
          .json({ message: 'no github profile found, error 404' });
      }
      res.json(JSON.parse(body)); //else if it''s good
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('server error...');
  }
});

module.exports = router;
