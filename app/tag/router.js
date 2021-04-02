const router = require("express").Router();
const multer = require("multer");
const tagController = require("./controller");

router.get("/tag", tagController.index);
router.post("/tag", multer().none(), tagController.store);
router.put("/tag/:id", multer().none(), tagController.update);
router.delete("/tag/:id", tagController.destroy);

module.exports = router;
