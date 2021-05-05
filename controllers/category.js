const slugify = require('slugify');
const Category = require('../models/category');
const Product = require('../models/product');
const Sub = require('../models/subCategory');

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await new Category({ name, slug: slugify(name) }).save();

    res.json(category);
  } catch (err) {
    res.status(400).send('Create category failed');
  }
};

exports.list = async (req, res) => {
  try {
    res.json(await Category.find({}).sort({ createdAt: -1 }).exec());
  } catch (err) {
    res.status(400).send('Error in fetching categories');
  }
};

exports.read = async (req, res) => {
  console.log(req.params);
  const category = await Category.findOne({ slug: req.params.slug }).exec();
  const products = await Product.find({ category: category })
    .populate('category')
    .exec();
  res.json({ category, products });
};

exports.update = async (req, res) => {
  console.log(req.body);
  const { name } = req.body;
  try {
    const updated = await Category.findOneAndUpdate(
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
    const deleted = await Category.findOneAndDelete({ slug: req.params.slug });
    res.json(deleted);
  } catch (err) {
    console.log(err);
    res.status(400).send('Delete failed');
  }
};

exports.getSubs = async (req, res) => {
  console.log(req.params);
  try {
    const subs = await Sub.find({ parent: req.params._id }).exec();
    console.log(subs);
    res.json(subs);
  } catch (err) {
    console.log(err);
  }
};
