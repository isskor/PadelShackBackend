const User = require('../models/user');

exports.createOrUpdateUser = async (req, res) => {
  const { name, picture, email } = req.user;

  const user = await User.findOneAndUpdate(
    { email },
    { name: email.split('@')[0], picture },
    { new: true }
  );

  if (user) {
    // user found and updated
    console.log('user updated');
    res.json(user);
  } else {
    // create new and save
    const newUser = await new User({
      email,
      name: email.split('@')[0],
      picture,
    }).save();

    console.log('user created');
    res.json(newUser);
  }
};

exports.currentUser = async (req, res) => {
  User.findOne({ email: req.user.email }).exec((err, user) => {
    if (err) throw new Error(err);
    res.json(user);
  });
};
