const slugify = require('slugify');
const Color = require('../models/color');

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    const color = await new Color({ name, slug: slugify(name) }).save();

    res.json(color);
  } catch (err) {
    res.status(400).send('Create color failed');
  }
};

exports.list = async (req, res) => {
  try {
    res.json(await Color.find({}).sort({ createdAt: -1 }).exec());
  } catch (err) {
    res.status(400).send('Error in fetching Color');
  }
};
exports.read = async (req, res) => {
  console.log(req.params);
  const color = await Color.findOne({ slug: req.params.slug }).exec();
  res.json({ color });
};

exports.update = async (req, res) => {
  console.log(req.body);
  const { name } = req.body;
  try {
    const updated = await Color.findOneAndUpdate(
      { slug: req.params.slug },
      { name, slug: slugify(name) },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).send('update failed');
  }
};

exports.remove = async (req, res) => {
  console.log(req.params);
  try {
    const deleted = await Color.findOneAndDelete({ slug: req.params.slug });
    res.json(deleted);
  } catch (err) {
    console.log(err);
    res.status(400).send('Delete failed');
  }
};
