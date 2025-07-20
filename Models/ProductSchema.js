const mongoose = require("mongoose")

const productScheme = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    code: { type: Number, required: true, unique: true, trim: true },
    stock: { type: Number, required: true, min: 0 },
    status: { type: Boolean, required: false, default: true },
    thumbnails: {
      type: [String], // Array de strings para las URLs de imagenes
      required: true,
      validate: {
        validator: (v) => v && v.length > 0,
        message: "Debe tener al menos una imagen",
      },
    },
  },
  {
    collection: "products", // Nombre explicito de la colección
  },
)

const Products = mongoose.model("Products", productScheme)
module.exports = Products