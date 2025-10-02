import { Schema } from "mongoose";

// Extended to match frontend goal fields while keeping BE compatibility
const GoalSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "users", required: true },
    program: { type: Schema.Types.ObjectId, ref: "programs", default: null },
    // Store list of workouts for the goal period (FE sends array of IDs)
    workouts: [{ type: Schema.Types.ObjectId, ref: "workouts" }],
    // Keep BE fields for compatibility
    currentWorkout: { type: Schema.Types.ObjectId, ref: "workouts", default: null },
    targetWorkoutsPerWeek: { type: Number, min: 0, default: 3 },
    achieved: { type: Boolean, default: false },
    // FE weekly tracking fields
    year: { type: Number },
    week: { type: Number },
    target: { type: Number, min: 0, default: 3 },
    completed: { type: Number, min: 0, default: 0 },
    start: { type: Date },
  },
  { timestamps: true }
);

export { GoalSchema };