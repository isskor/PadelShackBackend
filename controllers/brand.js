const slugify = require('slugify');
const Brand = require('../models/brand');

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    const brand = await new Brand({ name, slug: slugify(name) }).save();

    res.json(brand);
  } catch (err) {
    res.status(400).send('Create Brand failed');
  }
};

exports.list = async (req, res) => {
  try {
    res.json(await Brand.find({}).sort({ createdAt: -1 }).exec());
  } catch (err) {
    res.status(400).send('Error in fetching Color');
  }
};

exports.read = async (req, res) => {
  console.log(req.params);
  const brand = await Brand.findOne({ slug: req.params.slug }).exec();
  res.json({ brand });
};

exports.update = async (req, res) => {
  console.log(req.body);
  const { name } = req.body;
  try {
    const updated = await Brand.findOneAndUpdate(
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
    const deleted = await Brand.findOneAndDelete({ slug: req.params.slug });
    res.json(deleted);
  } catch (err) {
    console.log(err);
    res.status(400).send('Delete failed');
  }
};
