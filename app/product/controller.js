const Product = require("./model");
const config = require("../config");
const fs = require("fs");
const path = require("path");
const { error } = require("console");

async function store(req, res, next) {
  try {
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
          const payload = req.body;
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
      const payload = req.body;
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

module.exports = {
  store,
};
