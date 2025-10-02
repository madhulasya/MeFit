import { Schema } from "mongoose";

const ProgramSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

export { ProgramSchema };