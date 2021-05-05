const slugify = require('slugify');
const subCategory = require('../models/subCategory');
const Product = require('../models/product');

exports.create = async (req, res) => {
  try {
    const { name, parent } = req.body;
    const sub = await new subCategory({
      name,
      parent,
      slug: slugify(name),
    }).save();

    res.json(sub);
  } catch (err) {
    res.status(400).send('Create category failed');
    console.log(err.message);
  }
};

exports.list = async (req, res) => {
  try {
    res.json(await subCategory.find({}).sort({ createdAt: -1 }).exec());
  } catch (err) {
    res.status(400).send('Error in fetching categories');
  }
};

exports.read = async (req, res) => {
  console.log(req.params);
  const sub = await subCategory.findOne({ slug: req.params.slug }).exec();
  const products = await Product.find({ subs: sub })
    .populate('category')
    .exec();
  console.log(sub);
  console.log(products);
  res.json({ sub, products });
};

exports.update = async (req, res) => {
  console.log(req.body);
  const { name, parentCat } = req.body;

  try {
    const updated = await subCategory.findOneAndUpdate(
      { slug: req.params.slug },
      { name, slug: slugify(name), parent: parentCat },
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
    const deleted = await subCategory.findOneAndDelete({
      slug: req.params.slug,
    });
    res.json(deleted);
  } catch (err) {
    console.log(err);
    res.status(400).send('Delete failed');
  }
};
