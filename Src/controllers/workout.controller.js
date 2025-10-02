import { Workout } from "../models/index.d.js";

export const listWorkouts = async (_req, res) => {
  try {
    const workouts = await Workout.find().populate("exercises program");
    return res.status(200).json({ workouts });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const createWorkout = async (req, res) => {
  try {
    const workout = await Workout.create({ ...req.body, createdBy: req.user.id });
    return res.status(201).json({ workout });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id).populate("exercises program");
    if (!workout) return res.status(404).json({ message: "Workout not found" });
    return res.status(200).json({ workout });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!workout) return res.status(404).json({ message: "Workout not found" });
    return res.status(200).json({ workout });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ message: "Workout not found" });
    await workout.deleteOne();
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};