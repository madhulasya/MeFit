import { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    roles: {
      type: [String],
      enum: ["Admin", "Contributor", "User"],
      default: ["User"],
    },
    // Optional profile fields used by the frontend
    picture: {
      type: String,
      default: "",
    },
    height: {
      type: Number,
      default: 170,
    },
    weight: {
      type: Number,
      default: 70,
    },
    level: {
      type: String,
      default: "Beginner",
      trim: true,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String, // base32 secret (consider encrypting in production)
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

export { UserSchema };
