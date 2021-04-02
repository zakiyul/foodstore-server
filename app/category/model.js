const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const categorySchema = Schema({
  name: {
    type: String,
    minlength: [3, "panjang nama kategori minimal 3 karakter"],
    maxlength: [20, "panjang nama kategori maksimal 20 karakter"],
    required: [true, "nama kategori harus diisi!"],
  },
});

module.exports = model("Category", categorySchema);
