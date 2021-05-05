const Product = require('../models/product');
const slugify = require('slugify');
const User = require('../models/user');

exports.create = async (req, res) => {
  try {
    console.log(req.body);
    req.body.slug = slugify(req.body.title);

    const newProduct = await new Product(req.body).save();

    res.json(newProduct);
  } catch (err) {
    res.status(400).json({
      err: err.message,
    });
    console.log(err);
  }
};

exports.getProducts = async (req, res) => {
  let products = await Product.find({})
    .limit(parseInt(req.params.count))
    .populate('category')
    .populate('subs')
    .populate('color')
    .populate('brand')
    .sort([['createdAt', 'asc']])
    .exec();

  res.json(products);
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Product.findOneAndRemove({
      slug: req.params.slug,
    }).exec();
    res.json(deleted);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
};

exports.readProduct = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('category')
    .populate('subs')
    .populate('color')
    .populate('brand')
    .exec();

  res.json(product);
};

exports.updateProduct = async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updated = await Product.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true }
    ).exec();
    res.json(updated);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ err: err.message });
  }
};

exports.listProducts = async (req, res) => {
  try {
    const { sort, order, page, itemsPerPage } = req.body;
    const currentPage = page || 1;
    const perPage = itemsPerPage || 3;
    const products = await Product.find({})
      .skip((currentPage - 1) * perPage)
      .populate('category')
      .populate('subs')
      .populate('color')
      .populate('brand')
      .sort([[sort, order]])
      .limit(perPage)
      .exec();
    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

exports.getProductsCount = async (req, res) => {
  let total = await Product.find({}).estimatedDocumentCount().exec();
  console.log(total);
  res.json(total);
};

exports.productStar = async (req, res) => {
  const { star } = req.body;

  const product = await Product.findById(req.params.productId).exec();
  const user = await User.findOne({ email: req.user.email }).exec();

  // who is updating?
  // check if currently logged user have already added rating to this product?

  let existingRatingObject = product.ratings.find(
    (el) => el.postedBy.toString() === user._id.toString()
  );

  // if user haven't left rating yet, push it to the rating array
  if (existingRatingObject === undefined) {
    let ratingAdded = await Product.findByIdAndUpdate(
      product._id,
      {
        $push: { ratings: { star, postedBy: user._id } },
      },
      { new: true }
    ).exec();
    console.log('rating added', ratingAdded);
    res.json(ratingAdded);
  } else {
    // if user have left before, update it
    const ratingUpdate = await Product.updateOne(
      { ratings: { $elemMatch: existingRatingObject } },
      { $set: { 'ratings.$.star': star } },
      { new: true }
    ).exec();
    console.log('ratingupdt', ratingUpdate);
    res.json(ratingUpdate);
  }
};

exports.getRelated = async (req, res) => {
  const product = await Product.findById(req.params.productId).exec();

  const related = await Product.find({
    // excluding this productId
    _id: { $ne: product._id },
    category: product.category,
  })
    .limit(3)
    .populate('category')
    .populate('subs')
    .populate('postedBy')
    .exec();
  console.log(related);

  res.json(related);
};

// search / filters

const handleQuery = async (req, res, query) => {
  const products = await Product.find({ $text: { $search: query } })
    .populate('category', '_id name')
    .populate('subs', '_id name')
    .populate('postedBy', '_id name')
    .exec();

  res.json(products);
};

const handlePrice = async (req, res, price) => {
  try {
    let products = await Product.find({
      price: {
        $gte: price[0],
        $lte: price[1],
      },
    })
      .populate('category', '_id name')
      .populate('subs', '_id name')
      .populate('postedBy', '_id name')
      .exec();
    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

const handleCategory = async (req, res, category) => {
  try {
    let products = await Product.find({ category })
      .populate('category', '_id name')
      .populate('subs', '_id name')
      .populate('postedBy', '_id name')
      .exec();

    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

const handleStar = async (data, res, stars) => {
  // console.log('199', { ...req.body.rest });
  console.log('DATA IN STAR _______', data);

  // let data = {};
  // if (req.body.rest) {
  //   const { subs, category, color, brand } = req.body.rest;
  //   if (subs && subs.length > 0) data = { ...data, subs: { $in: subs } };
  //   if (category && category.length > 0) data = { ...data, category };
  //   if (color && color.length > 0) data = { ...data, color };
  //   if (brand && brand.length > 0) data = { ...data, brand };
  // }

  // console.log('data =====>', data);
  Product.aggregate([
    {
      $project: {
        document: '$$ROOT',
        // title: '$title'
        floorAverage: {
          $floor: { $avg: '$ratings.star' },
        },
      },
    },
    { $match: { floorAverage: { $in: stars } } },
  ])
    .limit(12)
    .exec((err, aggregates) => {
      if (err) console.log('AGGREATE ERROR', err);
      console.log('AGGRETAGES -----> ', aggregates);
      Product.find({
        _id: aggregates,
        ...data,
      })
        .populate('category', '_id name')
        .populate('subs', '_id name')
        .populate('postedBy', '_id name')
        .populate('color')
        .populate('brand')
        .exec((err, products) => {
          if (err) console.log('products aggregate error', err);
          console.log('RES ------->', products);
          res.json(products);
        });
    });
};

const handleSub = async (req, res, sub) => {
  const products = await Product.find({ subs: sub })
    .populate('category', '_id name')
    .populate('subs', '_id name')
    .populate('postedBy', '_id name')
    .exec();

  res.json(products);
};
const handleShipping = async (req, res, shipping) => {
  const products = await Product.find({ shipping })
    .populate('category', '_id name')
    .populate('subs', '_id name')
    .populate('postedBy', '_id name')
    .exec();

  res.json(products);
};
const handleColor = async (req, res, color) => {
  const products = await Product.find({ color })
    .populate('category', '_id name')
    .populate('subs', '_id name')
    .populate('postedBy', '_id name')
    .exec();

  res.json(products);
};
const handleBrand = async (req, res, brand) => {
  const products = await Product.find({ brand })
    .populate('category', '_id name')
    .populate('subs', '_id name')
    .populate('postedBy', '_id name')
    .exec();

  res.json(products);
};

exports.searchFilters = async (req, res) => {
  console.log(req.body);
  const { sortFilter } = req.body;
  const { query, price } = req.body.filters;
  const { pageSize, currentPage } = req.body.page;
  console.log(req.body);
  console.log('searchFILTERS');

  let data = {};
  if (query && query.length > 0)
    data = { ...data, title: { $regex: query, $options: 'i' } };

  if (price && price.length > 0)
    data = {
      ...data,
      price: {
        $gte: price[0],
        $lte: price[1],
      },
    };

  const { subs, category, color, brand, shape, stars } = req.body.filters.rest;

  if (subs && subs.length > 0) data = { ...data, subs: { $in: subs } };
  if (category && category.length > 0) data = { ...data, category };
  if (color && color.length > 0) data = { ...data, color: { $in: color } };
  if (brand && brand.length > 0) data = { ...data, brand };
  if (shape && shape.length > 0) data = { ...data, shape };

  console.log('DATRA', data);
  try {
    if (stars && stars.length > 0) {
      return await handleStar(data, res, stars);
    }

    await Product.find({
      ...data,
    })

      .sort([sortFilter])
      .skip((currentPage - 1) * pageSize)
      .populate('category', '_id name')
      .populate('subs', '_id name')
      .populate('postedBy', '_id name')
      .populate('color')
      .populate('brand')
      .limit(pageSize)
      .exec((err, products) => {
        if (err) console.log('products fetching  error', err);
        // console.log('RES ------->', products);
        res.json(products);
      });
  } catch (err) {
    console.log(err);
  }

  // if (query) {
  //   console.log('query', query);

  //   await handleQuery(req, res, query);
  // }

  // if (price !== undefined) {
  //   console.log('price --->', price);
  //   await handlePrice(req, res, price);
  // }

  // if (category) {
  //   console.log('category -->', category);
  //   await handleCategory(req, res, category);
  // }

  // if (stars) {
  //   console.log('stars --> ', stars);
  //   await handleStar(req, res, stars);
  // }

  // if (sub) {
  //   console.log('sub--->', sub);
  //   await handleSub(req, res, sub);
  // }

  // if (shipping) {
  //   console.log('shipping ---> ', shipping);
  //   await handleShipping(req, res, shipping);
  // }
  // if (color) {
  //   console.log('shipping ---> ', color);
  //   await handleColor(req, res, color);
  // }
  // if (brand) {
  //   console.log('shipping ---> ', brand);
  //   await handleBrand(req, res, brand);
  // }
};
