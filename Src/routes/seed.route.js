import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { Program, Workout, Exercise } from "../models/index.d.js";

const router = Router();

// Small helper: upsert by unique key (here we use name)
async function upsertByName(Model, name, data) {
  return await Model.findOneAndUpdate(
    { name },
    { $setOnInsert: data },
    { new: true, upsert: true }
  );
}

async function runSeed({ userId }) {
  // 1) Exercises
  const ex1 = await upsertByName(Exercise, "Barbell Bench Press", {
    name: "Barbell Bench Press",
    description: "Classic chest strength movement.",
    targetMuscleGroup: "Chest",
    createdBy: userId || undefined,
  });
  const ex2 = await upsertByName(Exercise, "Back Squat", {
    name: "Back Squat",
    description: "Lower body strength staple.",
    targetMuscleGroup: "Legs",
    createdBy: userId || undefined,
  });
  const ex3 = await upsertByName(Exercise, "Plank", {
    name: "Plank",
    description: "Core stability hold.",
    targetMuscleGroup: "Core",
    createdBy: userId || undefined,
  });
  const ex4 = await upsertByName(Exercise, "Jump Rope", {
    name: "Jump Rope",
    description: "Simple cardio conditioning.",
    targetMuscleGroup: "Full Body",
    createdBy: userId || undefined,
  });

  // 2) Program
  const program = await upsertByName(Program, "2-Week Starter Base", {
    name: "2-Week Starter Base",
    category: "Strength",
    description: "Intro plan mixing strength, core, and light cardio.",
  });

  // 3) Workouts (link some to program)
  const wo1 = await upsertByName(Workout, "Upper Body Push", {
    name: "Upper Body Push",
    type: "Strength",
    sets: 4,
    exercises: [ex1._id],
    program: program._id,
    createdBy: userId || undefined,
  });

  const wo2 = await upsertByName(Workout, "Lower Body Strength", {
    name: "Lower Body Strength",
    type: "Strength",
    sets: 4,
    exercises: [ex2._id],
    program: program._id,
    createdBy: userId || undefined,
  });

  const wo3 = await upsertByName(Workout, "Core Stability", {
    name: "Core Stability",
    type: "Mobility",
    sets: 3,
    exercises: [ex3._id],
    createdBy: userId || undefined,
  });

  const wo4 = await upsertByName(Workout, "Cardio Quick", {
    name: "Cardio Quick",
    type: "Cardio",
    sets: 1,
    exercises: [ex4._id],
    createdBy: userId || undefined,
  });

  return {
    program: program._id,
    workouts: [wo1._id, wo2._id, wo3._id, wo4._id],
    exercises: [ex1._id, ex2._id, ex3._id, ex4._id],
  };
}

// Dev-friendly seed: open in non-production, disabled in production
router.post("/dev", async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ message: "Disabled in production" });
    }
    const result = await runSeed({ userId: undefined });
    res.json({ status: "ok", seeded: result });
  } catch (err) {
    next(err);
  }
});

// Secure seed: require Admin in any environment
router.post("/", authenticate, authorize("Admin"), async (req, res, next) => {
  try {
    const result = await runSeed({ userId: req.user?.id });
    res.json({ status: "ok", seeded: result });
  } catch (err) {
    next(err);
  }
});

export { router as seedRouter };