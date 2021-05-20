const Product = require("./model");
const Category = require("../category/model");
const Tag = require("../tag/model");
const config = require("../config");
const fs = require("fs");
const path = require("path");
const { error } = require("console");
const { policyFor } = require("../policy");

async function index(req, res, next) {
  try {
    const {
      limit = 10,
      skip = 0,
      q = "",
      category = "",
      tags = [],
    } = req.query;
    let criteria = {};

    if (q.length) {
      criteria = {
        ...criteria,
        name: { $regex: `${q}`, $options: "i" },
      };
    }

    if (category.length) {
      category = await Category.findOne({
        name: { $regex: `${category}` },
        $options: "i",
      });
      if (category) {
        criteria = { ...criteria, category: category._id };
      }
    }

    if (tags.length) {
      tags = await Tag.find({ name: { $in: tags } });
      criteria = { ...criteria, tags: { $in: tags.map((tag) => tag._id) } };
    }

    const products = await Product.find(criteria)
      .populate("category")
      .populate("tags")
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    return res.json(products);
  } catch (error) {
    next(error);
  }
}

async function store(req, res, next) {
  try {
    let policy = policyFor(req.user);

    if (!policy.can("create", "Product")) {
      return res.json({
        error: 1,
        message: "Anda tidak memiliki akses untuk membuat produk",
      });
    }

    let payload = req.body;

    if (payload.tags && payload.tags.length) {
      const tags = await Tag.find({ name: { $in: payload.tags } });
      if (tags.length) {
        payload = { ...payload, tags: tags.map((tag) => tag._id) };
      }
    }

    if (payload.category) {
      const category = await Category.findOne({
        name: { $regex: payload.category, $options: "i" },
      });
      if (category) {
        payload = { ...payload, category: category._id };
      } else {
        delete payload.category;
        vf;
      }
    }

    if (req.file) {
      const tmp_path = req.file.path;
      const originalExt = req.file.originalname.split(".")[
        req.file.originalname.split(".").length - 1
      ];
      const filename = req.file.filename + "." + originalExt;
      const target_path = path.resolve(
        config.rootPath,
        `public/upload/${filename}`
      );
      const src = fs.createReadStream(tmp_path);
      const dest = fs.createWriteStream(target_path);
      src.pipe(dest);
      src.on("end", async () => {
        try {
          const product = new Product({ ...payload, image_url: filename });
          await product.save();
          return res.json(product);
        } catch (error) {
          fs.unlinkSync(target_path);
          if (error && error.name === "ValidationError") {
            return res.json({
              error: 1,
              message: error.message,
              fields: error.errors,
            });
          }
          next(error);
        }
      });
      src.on("error", async () => {
        next(error);
      });
    } else {
      const product = new Product(payload);
      await product.save();
      return res.json(product);
    }
  } catch (error) {
    if (error && error.message === "ValidationError") {
      return res.json({
        error: 1,
        message: error.message,
        fileds: error.errors,
      });
    }
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const policy = policyFor(req.user);

    if (!policy.can("update", "Product")) {
      return res.json({
        error: 1,
        message: "Anda tidak memiliki akses untuk mengupdate produk",
      });
    }

    let payload = req.body;

    if (payload.tags && payload.tags.length) {
      const tags = await Tag.find({ name: { $in: payload.tags } });
      if (tags.length) {
        payload = { ...payload, tags: tags.map((tag) => tag._id) };
      }
    }

    if (payload.category) {
      const category = await Category.findOne({
        name: { $regex: payload.category, $options: "i" },
      });
      if (category) {
        payload = { ...payload, category: category._id };
      } else {
        delete payload.category;
        vf;
      }
    }

    if (req.file) {
      const tmp_path = req.file.path;
      const originalExt = req.file.originalname.split(".")[
        req.file.originalname.split(".").length - 1
      ];
      const filename = req.file.filename + "." + originalExt;
      const target_path = path.resolve(
        config.rootPath,
        `public/upload/${filename}`
      );
      const src = fs.createReadStream(tmp_path);
      const dest = fs.createWriteStream(target_path);
      src.pipe(dest);
      src.on("end", async () => {
        try {
          let product = Product.findOne({ _id: req.params.id });
          const currentImg = `${config.rootPath}/public/upload/${product.image_url}`;
          if (fs.existsSync(currentImg)) {
            fs.unlinkSync(currentImg);
          }
          product = await Product.findOneAndUpdate(
            { _id: req.params.id },
            { ...payload, image_url: filename },
            { new: true, runValidators: true }
          );
          return res.json(product);
        } catch (error) {
          fs.unlinkSync(target_path);
          if (error && error.name === "ValidationError") {
            return res.json({
              error: 1,
              message: error.message,
              fields: error.errors,
            });
          }
          next(error);
        }
      });
      src.on("error", async () => {
        next(error);
      });
    } else {
      const product = await Product.findOneAndUpdate(
        { _id: req.params.id },
        payload,
        { new: true, runValidators: true }
      );
      return res.json(product);
    }
  } catch (error) {
    if (error && error.message === "ValidationError") {
      return res.json({
        error: 1,
        message: error.message,
        fileds: error.errors,
      });
    }
    next(error);
  }
}

async function destory(req, res, next) {
  try {
    const policy = policyFor(req.user);
    if (!policy.can("delete", "Product")) {
      return res.json({
        error: 1,
        message: "Anda tidak memiliki akses untuk menghapus produk",
      });
    }
    const product = await Product.findOneAndDelete({ _id: req.params.id });
    const currentImg = `${config.rootPath}/public/upload/${product.image_url}`;
    if (fs.existsSync) {
      fs.unlinkSync(currentImg);
    } else {
      res.json({ message: "product image not found!" });
    }
    return res.json(product);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  index,
  store,
  update,
  destory,
};
