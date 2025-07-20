const mongoose = require("mongoose")

const cartScheme = new mongoose.Schema(
  {
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
  },
  {
    collection: "carts",
    timestamps: true, 
  },
)

const Cart = mongoose.model("Carts", cartScheme)
module.exports = Cart