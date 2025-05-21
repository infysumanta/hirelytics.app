import mongoose, { Document, Schema, Model } from "mongoose";

export interface IWishlist extends Document {
  name: string;
  email: string;
  reason?: string;
  createdAt: Date;
}

const wishlistSchema = new Schema<IWishlist>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Check if model already exists to prevent overwriting during hot reloads
const Wishlist: Model<IWishlist> =
  mongoose.models.Wishlist ||
  mongoose.model<IWishlist>("Wishlist", wishlistSchema);

export default Wishlist;
