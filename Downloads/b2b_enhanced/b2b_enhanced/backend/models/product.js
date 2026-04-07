import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    Images: [String],

    Description: String,

    Name: String,
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
