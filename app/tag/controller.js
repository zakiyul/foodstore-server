const Tag = require("./model");

async function index(req, res, next) {
  try {
    const tag = await Tag.find();
    return res.json(tag);
  } catch (error) {
    next(error);
  }
}

async function store(req, res, next) {
  try {
    const payload = req.body;
    const tag = new Tag(payload);
    await tag.save();
    return res.json(tag);
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
    const tag = await Tag.findOneAndUpdate({ _id: req.params.id }, payload, {
      new: true,
      runValidators: true,
    });
    return res.json(tag);
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
    const tag = await Tag.findOneAndDelete({ _id: req.params.id });
    return res.json(tag);
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
