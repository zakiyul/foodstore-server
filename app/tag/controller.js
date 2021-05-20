const Tag = require("./model");
const { policyFor } = require("../policy");

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
    let policy = policyFor(req.user);

    if (!policy.can("create", "Tag")) {
      // <-- can create Tag
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk membuat tag`,
      });
    }
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
    let policy = policyFor(req.user);

    if (!policy.can("update", "Tag")) {
      // <-- can update Tag
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk mengupdate tag`,
      });
    }

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
    let policy = policyFor(req.user);

    if (!policy.can("delete", "Tag")) {
      // <-- can delete Tag
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk menghapus tag`,
      });
    }
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
