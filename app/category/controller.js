const Category = require("./model");

async function index(req, res, next) {
  try {
    const category = await Category.find();
    return res.json(category);
  } catch (error) {
    next(error);
  }
}

async function store(req, res, next) {
  try {
    const payload = req.body;
    const category = new Category(payload);
    await category.save();
    return res.json(category);
  } catch (error) {
    if (error && error.name === "ValidationError") {
      return res.json({
        error: 1,
        message: error.message,
        fields: error.errors,
      });
    }
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const payload = req.body;
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id },
      payload,
      { new: true, runValidators: true }
    );
    return res.json(category);
  } catch (error) {
    if (error && error.name === "ValidationError") {
      return res.json({
        error: 1,
        message: error.message,
        fields: error.errors,
      });
    }
    next(error);
  }
}

async function destroy(req, res, next) {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id });
    return res.json(category);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  index,
  store,
  update,
  destroy,
};
