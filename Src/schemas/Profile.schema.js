import { Schema } from "mongoose";

const ProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "users", required: true, unique: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    weight: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    medicalConditions: { type: String, trim: true },
    age: { type: Number, min: 0 },
    gender: { type: String, enum: ["Male", "Female", "Other"], default: "Other" },
  },
  { timestamps: true }
);

export { ProfileSchema };