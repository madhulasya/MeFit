import { Schema } from "mongoose";

const ExerciseSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    targetMuscleGroup: { type: String, trim: true },
    image: { type: String, trim: true },
    video: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true }
);

export { ExerciseSchema };