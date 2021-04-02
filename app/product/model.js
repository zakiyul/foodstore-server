const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const productSchema = Schema(
  {
    name: {
      type: String,
      minlength: [3, "panjang minimal 3 karakter"],
      maxlength: [255, "panjang maksimal 255 karakter"],
      require: [true, "Nama harus diisi!"],
    },

    description: {
      type: String,
      maxlength: [1000, "panjang deskripsi maksimal 1000 karakter"],
    },

    price: {
      type: Number,
      default: 0,
    },

    image_url: String,
  },
  { timestamps: true }
);

module.exports = model("Product", productSchema);
