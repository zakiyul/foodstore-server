const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../user/model");
const config = require("../config");

async function register(req, res, next) {
  try {
    const payload = req.body;
    const user = new User(payload);
    await user.save();
    return res.json(user);
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

async function localStrategy(email, password, done) {
  try {
    const user = await User.findOne({ email }).select(
      "-__v -createdAt -updatedAt -cart_items -token"
    );
    if (!user) return done();
    if (bcrypt.compareSync(password, user.password)) {
      ({ password, ...userWithoutPassword } = user.toJSON());
      return done(null, userWithoutPassword);
    }
  } catch (error) {
    done(error, null);
  }
  done();
}

async function login(req, res, next) {
  passport.authenticate("local", async function (err, user) {
    if (err) return next(err);
    if (!user)
      return res.json({ error: 1, message: "email or password incorrect" });
    let signed = jwt.sign(user, config.secretKey);
    await User.findOneAndUpdate(
      { _id: user._id },
      { $push: { token: signed } },
      { new: true }
    );

    return res.json({
      message: "logged in successfully",
      user: user,
      token: signed,
    });
  })(req, res, next);
}

module.exports = {
  register,
  localStrategy,
  login,
};
