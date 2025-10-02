/**
 * Centralized model exporter for Mongoose schemas
 */
import { model } from "mongoose";

import { UserSchema } from "../schemas/User.schema.js";
import { ProfileSchema } from "../schemas/Profile.schema.js";
import { ProgramSchema } from "../schemas/Program.schema.js";
import { WorkoutSchema } from "../schemas/Workout.schema.js";
import { ExerciseSchema } from "../schemas/Exercise.schema.js";
import { GoalSchema } from "../schemas/Goal.schema.js";

const User = model("users", UserSchema);
const Profile = model("profiles", ProfileSchema);
const Program = model("programs", ProgramSchema);
const Workout = model("workouts", WorkoutSchema);
const Exercise = model("exercises", ExerciseSchema);
const Goal = model("goals", GoalSchema);

export { User, Profile, Program, Workout, Exercise, Goal };
