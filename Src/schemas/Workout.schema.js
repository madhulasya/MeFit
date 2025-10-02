import { Schema } from "mongoose";

const WorkoutSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, trim: true },
    sets: { type: Number, min: 0 },
    exercises: [{ type: Schema.Types.ObjectId, ref: "exercises" }],
    program: { type: Schema.Types.ObjectId, ref: "programs" },
    createdBy: { type: Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true }
);

export { WorkoutSchema };