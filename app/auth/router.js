const router = require("express").Router();
const passport = require("passport");
const multer = require("multer");
const LocalStrategy = require("passport-local").Strategy;
const controller = require("./controller");

passport.use(
  new LocalStrategy({ usernameField: "email" }, controller.localStrategy)
);

router.post("/register", multer().none(), controller.register);
router.post("/login", multer().none(), controller.login);

module.exports = router;
